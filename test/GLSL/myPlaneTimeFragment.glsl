varying vec4 myeyepos;
uniform float pos;
uniform vec3 color;
void main() { 
    vec4 mycolor;
    if(myeyepos.x < pos)
    mycolor = vec4(color,1);
    else
    mycolor = vec4(0.0, 0.0, 0.0, 0.0);
    
    gl_FragColor = mycolor; 
}