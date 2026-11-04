#!/bin/zsh
# Aufruf: install_dish.sh <id> <result-uuid>  → lädt 4K/2K-Foto, stellt frei, legt es nach public/menu/<id>.png
cd "$(dirname "$0")/.." || exit 1
id="$1"; uuid="$2"
raw="../EISWERK-frames/menu-photos/$id-raw.jpg"
curl -sL -o "$raw" "https://edit.comfyonline.app/result/$uuid.jpg" || exit 1
python3 tools/key_blue.py "$raw" "public/menu/$id.png" 1100
python3 -c "from PIL import Image; Image.open('public/menu/$id.png').convert('RGBA').save('public/menu/$id.webp','WEBP',quality=80,method=6)"
python3 -c "
from PIL import Image
im=Image.open('public/menu/$id.png'); bg=Image.new('RGB',im.size,(60,16,42)); bg.paste(im,mask=im.getchannel('A')); bg.thumbnail((900,900)); bg.save('../EISWERK-frames/menu-photos/key-$id.jpg',quality=88)"
