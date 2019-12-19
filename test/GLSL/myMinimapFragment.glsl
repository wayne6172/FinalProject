uniform sampler2D texture;
varying vec2 vUv;
uniform vec2 center[CENTER_MAX];
uniform float minRange, maxRange;

void main() {
    vec4 color;
    
    float dis;

    float opacity = 0.0;
    float nowOpacity = 0.0;

    for(int i = 0; i < CENTER_MAX; i++){
        dis = distance (gl_FragCoord.st, center[i]);

        if (dis < minRange)  
            nowOpacity = 1.0;
        else if(dis < maxRange)
            nowOpacity = 1.0 - ((dis - minRange) / (maxRange - minRange));
        
        opacity = opacity > nowOpacity ? opacity : nowOpacity;
    }

    color = texture2D (texture, vUv) * opacity;
    

    gl_FragColor = color;
}