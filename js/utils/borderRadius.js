const radius = (r1, r2, r3, r4) => `${r1}px ${r2}px ${r3}px ${r4}px`;

function componentBorderRadius(l, c, i, r, count = 5) {
    const lir = i - (i % 10) + count + 10
    i = parseInt(i)
    const comp = tmp[l][c]
    if (!comp[i].unlocked) return { "border-radius": "0" }
    const w = [false, false, false, false]
    const [im10, ip1, ip10, im1] = [i - 10, i + 1, i + 10, i - 1]
    w[0] = comp[im10] ? !comp[im10].unlocked : true
    w[1] = comp[ip1] ? !comp[ip1].unlocked : true
    w[2] = comp[ip10] ? !comp[ip10].unlocked : true
    w[3] = comp[im1] ? !comp[im1].unlocked : true
    if (i % 10 == 1) w[2] = comp[lir] ? !comp[lir].unlocked : true
    const r1 = w[3] && w[0] ? r : 0
    const r2 = w[0] && w[1] ? r : 0
    const r3 = w[1] && w[2] ? r : 0
    const r4 = w[2] && w[3] ? r : 0
    return { "border-radius": radius(r1, r2, r3, r4) }
}

function milestoneBorderRadius(l, i, r) {
    i = parseInt(i)
    const comp = tmp[l].milestones
    if (!comp[i].unlocked) return { "border-radius": "0" }
    const [im1, ip1] = [i - 1, i + 1]
    const top = (comp[im1] ? !comp[im1].unlocked : true) ? r : 0
    const bottom = (comp[ip1] ? !comp[ip1].unlocked : true) ? r : 0
    return { "border-radius": radius(top, top, bottom, bottom) }
}
