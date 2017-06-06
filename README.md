# Motion Blur Plugin for GSAP

## Use
```
import './BlurPlugin';

TweenLite.fromTo(myDiv, 1, {blur: { blurX: 2, blurY: 2 } }, { blur: { blurX: 0, blurY: 0 }});
```

## Keep in mind that you have to use `fromTo`.

## Note
I added a fallback for IE/Edge, unfortunately, in that case, you can't control X and Y, it's a single value controlling the blur.