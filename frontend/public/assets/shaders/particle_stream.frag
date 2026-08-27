precision mediump float;

uniform sampler2D colormap;
uniform float speedMin;
uniform float speedMax;

varying float vLife;
varying vec3 vVelocity;

void main() {
    float speed = length(vVelocity);
    float t = clamp((speed - speedMin) / (speedMax - speedMin), 0.0, 1.0);
    vec4 color = texture2D(colormap, vec2(t, 0.5));
    color.a *= vLife;
    gl_FragColor = color;
}