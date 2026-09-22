"""The encoder half of the media exception (docs/add-a-game.md, "Media: the one exception to pristine").

Reads a JSON list of absolute image paths on stdin; for each, encodes WebP at the SAME pixel size and the SAME frame
count, keeps the smaller of lossy quality 0 and lossless, and writes it IN PLACE under the original filename only when
it is smaller than the original. Prints one JSON line per file. Driven by tools/media.mjs, which re-reads every file
it wrote and refuses a size change — this script is not trusted to have kept the dimensions.

Pillow >= 12.3.0 (every earlier 12.x carries the 2026-07-20 advisories) from the repo's own .venv:
    python3 -m venv .venv && .venv/bin/pip install -r tools/media-requirements.txt
Only the PNG, GIF, JPEG and WebP decoders are ever reached (`formats=`), whatever a file's bytes claim to be.
"""
import io
import json
import os
import sys

import PIL
from PIL import Image

MIN_PILLOW = (12, 3, 0)
FORMATS = ['PNG', 'GIF', 'JPEG', 'WEBP']
# Lossy: quality 0 is the ruling's "maximum compression"; alpha at 0 too. method 6 = the encoder's slowest, smallest.
LOSSY = dict(quality=0, alpha_quality=0, method=6)
LOSSLESS = dict(lossless=True, quality=100, method=6)
# ⛔ The mutant hook for the dimension assertion (tools/media.mjs owns the assertion, loader/media.test.mjs drives it):
# with this set, every frame is HALVED before encoding — exactly the downscale the ruling forbids — and this script's
# own size check below stands aside, so what is left to catch it is the assertion in media.mjs.
DOWNSCALE_MUTANT = os.environ.get('TMT_MEDIA_MUTANT') == 'downscale'


def frames_of(im):
    """Every frame as RGBA at the image's own size, and each frame's duration (ms)."""
    frames, durations = [], []
    n = getattr(im, 'n_frames', 1)
    for i in range(n):
        im.seek(i)
        frames.append(im.convert('RGBA'))
        durations.append(im.info.get('duration', 0) or 0)
    return frames, durations


def encode(frames, durations, loop, opts):
    if DOWNSCALE_MUTANT:
        frames = [f.resize((max(1, f.width // 2), max(1, f.height // 2))) for f in frames]
    out = io.BytesIO()
    if len(frames) == 1:
        frames[0].save(out, 'WEBP', **opts)
    else:
        frames[0].save(out, 'WEBP', save_all=True, append_images=frames[1:], duration=durations, loop=loop,
                       minimize_size=True, allow_mixed=True, **opts)
    return out.getvalue()


def process(p):
    before = os.path.getsize(p)
    with Image.open(p, formats=FORMATS) as im:
        fmt, size = im.format, im.size
        if fmt == 'WEBP':
            return {'path': p, 'action': 'already-webp', 'before': before}
        n = getattr(im, 'n_frames', 1)
        # GIF: no NETSCAPE block = play ONCE (Pillow leaves `loop` out of info); WebP's loop 0 would be forever.
        # APNG: num_plays, 0 = forever — the same meaning as WebP's.
        loop = im.info.get('loop', 1 if n > 1 else 0)
        if 'exif' in im.info and fmt == 'JPEG':
            orient = im.getexif().get(0x0112, 1)
            if orient not in (1, None):
                return {'path': p, 'action': 'skip', 'before': before, 'why': f'EXIF orientation {orient}: WebP would drop it and the browser would draw it unrotated'}
        frames, durations = frames_of(im)
    lossy = encode(frames, durations, loop, LOSSY)
    # Lossless is tried on STILLS only: on the animated GIFs it is ~70x the lossy size (Nitrogen.gif 24.7 MB against
    # 0.33 MB) and, at method 6 with minimize_size, ran past 10 minutes on that one file without finishing.
    lossless = encode(frames, durations, loop, LOSSLESS) if len(frames) == 1 else None
    best, mode = (lossy, 'lossy') if lossless is None or len(lossy) <= len(lossless) else (lossless, 'lossless')
    if len(best) >= before:
        return {'path': p, 'action': 'skip', 'before': before, 'why': f'WebP is not smaller ({len(best)} >= {before} bytes)', 'format': fmt, 'frames': n}
    with Image.open(io.BytesIO(best), formats=['WEBP']) as chk:
        if not DOWNSCALE_MUTANT and chk.size != size or getattr(chk, 'n_frames', 1) != n:
            raise SystemExit(f'{p}: the encoded WebP is {chk.size} x {getattr(chk, "n_frames", 1)} frames, the original {size} x {n}')
    with open(p, 'wb') as f:
        f.write(best)
    return {'path': p, 'action': 'encoded', 'mode': mode, 'before': before, 'after': len(best), 'format': fmt, 'frames': n, 'width': size[0], 'height': size[1]}


def main():
    have = tuple(int(x) for x in PIL.__version__.split('.')[:3])
    if have < MIN_PILLOW:
        sys.exit(f'Pillow {PIL.__version__} < {".".join(map(str, MIN_PILLOW))}: install tools/media-requirements.txt into .venv')
    for p in json.load(sys.stdin):
        print(json.dumps(process(p)), flush=True)


if __name__ == '__main__':
    main()
