import ast
name = input("Enter name of layer: ")
code = input("Enter shortening of layer: ")
combo = input("Enter comma seperated combo to make layer: ").split(",")
info = input("Enter info: ")
nameAlt = name.replace(" ", "_")
layerFile = open("layers.js","r+")
modFile = open("mod.js","r+")
layers = layerFile.read().split("\n")

addition1 = "]], [['" + code + "'],["
for i in combo:
    i = i.replace(" ","_")
    addition1 = addition1 + "'" + i + "',"
addition1 = addition1 + "'null']]],"
layers[140] = layers[140].replace("]]],", addition1)

prevId = layers[142][-3:]

if prevId[1] == "1":
    newId = str(int(prevId[0]) + 1) + "01"
    
    
else:
    
    newId = str(int(prevId) + 1)

layers[142] = layers[142] + ",'" + code + "'" + ":" + newId
layers[149] = layers[149] + "," + newId + ":'" + nameAlt + "'"

rowFile = open("rows.txt", "r+")
dicts = rowFile.read().split("\n")
rowDict = ast.literal_eval(dicts[1])
idDict = ast.literal_eval(dicts[0])
rows = [rowDict[i] for i in combo]

layerRow = max(rows) + 1
layerBranches = [idDict[i] for i in rowDict if rowDict[i] == max(rows) and i in combo]

layers = "\n".join(layers)

extraLayer = "),\naddNode('" + code + "', {\n\tsymbol: '" + name + "',\n\tcanClick() {return true},\n\trow: " + str(layerRow) + ",\n\ttooltip() {return '" + info + "'},\n\tbranches: " + str(layerBranches) + ",\n\tlayerShown() {return player.unlocks['" + code + "']},\n\tnodeStyle: {\n\t\t'font-size': '20px',\n\t}\n})"
layers = layers[:-1]

rowDict[name] = layerRow
idDict[name] = code

for i in combo:
    if i not in rowDict:
        print("ERROR")
        exit()
mod = modFile.read().split("\n")
mod[60] = mod[60] + ",'" + code + "': false"
mod = "\n".join(mod)

modFile.close()
layerFile.close()
rowFile.close()
modFile = open("mod.js","w")
layerFile = open("layers.js","w")
rowFile = open("rows.txt","w")
layers = layers + extraLayer
layerFile.write(layers)
layerFile.close()
modFile.write(mod)
modFile.close()
rowFile.write(str(idDict) + "\n" + str(rowDict))
rowFile.close()
