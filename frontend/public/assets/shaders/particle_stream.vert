attribute vec3 position;
attribute vec3 velocity;
attribute float life;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float time;
uniform float pointSize;

varying float vLife;
varying vec3 vVelocity;

void main() {
    vec3 pos = position + velocity * time;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = pointSize * life;
    vLife = life;
    vVelocity = velocity;
}