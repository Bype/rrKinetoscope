#!/usr/bin/env python

import sys
from mutagen.mp4 import MP4
import Image, ImageDraw, ImageFont
import random

filename = sys.argv[1]
id4 = MP4(filename+'.mp4')
season = id4['\xa9alb'][0]
title = id4['\xa9nam'][0]
subtitle = id4['\xa9ART'][0]
comment = id4['\xa9cmt'][0]

yello=(236,208,120,240)
orange=(217,91,67,240)
red=(192,41,66,240)
violet=(84,36,55,240)
gris=(83,119,122,240)

collec=[yello,orange,red,violet,gris]

thumbnail = Image.open(filename+'.png')
small = thumbnail.copy()
small.thumbnail((16,9))
bgcolor = small.getpixel((8,4))
titleFrame = Image.new("RGBA", (640, 60),(0,0,0,240))

if(384 < sum(bgcolor)) :
    txtcolor=(32,32,32,200)
else:
    txtcolor=(216,216,216,200)

txtcolor=(255,255,255,255)

if (len(title)<40):
    titleFont = ImageFont.truetype("OSP-DIN.ttf", 35)
else:
    titleFont = ImageFont.truetype("OSP-DIN.ttf", 26)

subtitleFont = ImageFont.truetype("OSP-DIN.ttf", 25)

drawTitle = ImageDraw.Draw(titleFrame)
drawTitle.text((16,8),title, font=titleFont, fill=txtcolor)
drawTitle.text(((624-9*len(subtitle)),20),subtitle, font=subtitleFont, fill=txtcolor)
thumbnail.paste(titleFrame,(0,300),titleFrame)
thumbnail.save('ttl_'+filename+'.png','PNG')
