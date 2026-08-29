precision highp float;

uniform sampler3D volume;
uniform sampler2D transferFunction;

uniform vec3 rayOrigin;
uniform vec3 rayDir;
uniform float stepSize;
uniform int maxSteps;
uniform float threshold;

varying vec3 vPosition;
varying vec3 vWorldPos;

void main() {
    vec3 pos = rayOrigin;
    float accumulatedAlpha = 0.0;
    vec3 accumulatedColor = vec3(0.0);

    for (int i = 0; i < 200; i++) {
        if (i >= maxSteps) break;

        float density = texture2D(volume, pos).r;
        if (density > threshold) {
            vec4 color = texture2D(transferFunction, vec2(density, 0.5));
            accumulatedColor += color.rgb * color.a * (1.0 - accumulatedAlpha);
            accumulatedAlpha += color.a * (1.0 - accumulatedAlpha);
        }

        pos += rayDir * stepSize;
        if (pos.x < 0.0 || pos.x > 1.0 || pos.y < 0.0 || pos.y > 1.0 || pos.z < 0.0 || pos.z > 1.0) break;
        if (accumulatedAlpha >= 0.95) break;
    }

    gl_FragColor = vec4(accumulatedColor, accumulatedAlpha);
}