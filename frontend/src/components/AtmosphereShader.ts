import * as THREE from 'three';

/**
 * Custom GLSL Fresnel Atmospheric Scattering Shader
 * Produces the luminous cyan/blue atmospheric halo seen from orbit around Earth
 */
export const AtmosphereShader = {
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    uniform vec3 uColor;
    uniform float uIntensity;
    uniform float uPower;

    void main() {
      vec3 viewDir = normalize(-vPosition);
      float fresnel = 1.0 - dot(vNormal, viewDir);
      float atmosphere = pow(fresnel, uPower) * uIntensity;
      gl_FragColor = vec4(uColor, atmosphere);
    }
  `
};
