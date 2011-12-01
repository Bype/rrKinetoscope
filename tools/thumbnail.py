#!/usr/bin/env python

import sys
from mutagen.mp4 import MP4
import Image, ImageDraw, ImageFont
import random

filename = sys.argv[1]
id4 = MP4(filename+'.mp4')
season = id4['\xa9alb'][0]
episode = id4['\xa9nam'][0]
director = id4['\xa9ART'][0]
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
titleFrame = Image.new("RGBA", (1280, 160),bgcolor )

if(384 < sum(bgcolor) ):
    txtcolor=(32,32,32,200)
else:
    txtcolor=(216,216,216,200)

titleFont = ImageFont.truetype("Cabin-Bold-TTF.ttf", 50)
subtitleFont = ImageFont.truetype("Cabin-Bold-TTF.ttf", 40)
textFont = ImageFont.truetype("Cabin-Regular-TTF.ttf", 24)
drawTitle = ImageDraw.Draw(titleFrame)
drawTitle.text((16,8),season, font=titleFont, fill=txtcolor)
drawTitle.text((16,54),director, font=subtitleFont, fill=txtcolor)
drawTitle.text((16,104),comment[:120]+"...", font=textFont, fill=txtcolor)
box = drawTitle.textsize(episode,font=titleFont)
drawTitle.text((1264-box[0],8),episode, font=titleFont, fill=txtcolor)
thumbnail.paste(titleFrame,(0,560),titleFrame)
thumbnail.save('ttl_'+filename+'.png','PNG')
