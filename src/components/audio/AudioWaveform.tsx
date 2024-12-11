import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { GLView } from 'expo-gl';

interface AudioWaveformProps {
  audioData: Float32Array;
  width: number;
  height: number;
  barWidth?: number;
  barSpacing?: number;
  color?: string;
  maxBarHeight?: number;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({
  audioData,
  width,
  height,
  barWidth = 4,
  barSpacing = 2,
  color = '#007AFF',
  maxBarHeight = 100,
}) => {
  const xOffsetRef = useRef(0);
  const animationFrameRef = useRef<number>();

  const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  };

  const onContextCreate = (gl: WebGLRenderingContext) => {
    const vertexShaderSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      uniform vec3 color;
      void main() {
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    // Create shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) return;

    // Create program
    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Set color uniform
    const colorLocation = gl.getUniformLocation(program, 'color');
    const [r, g, b] = hexToRgb(color);
    gl.uniform3f(colorLocation, r / 255, g / 255, b / 255);

    // Create position buffer
    const positionBuffer = gl.createBuffer();
    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);

    const render = () => {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      const vertices: number[] = [];
      const bufferLength = audioData.length;

      for (let i = 0; i < width / (barWidth + barSpacing); i++) {
        const dataIndex = (i + Math.floor(xOffsetRef.current / (barWidth + barSpacing))) % bufferLength;
        const barHeight = Math.min(audioData[dataIndex] / 6, maxBarHeight);
        
        // Convert pixel coordinates to WebGL coordinates (-1 to 1)
        const x = (i * (barWidth + barSpacing)) - xOffsetRef.current;
        const xGL = (x / width) * 2 - 1;
        const barHeightGL = (barHeight / height) * 2;
        
        // Top arc
        const arcPoints = createArcPoints(
          xGL + (barWidth / width),
          barHeightGL / 2,
          (barWidth / width),
          Math.PI,
          0,
          10
        );
        vertices.push(...arcPoints);

        // Bottom arc
        const bottomArcPoints = createArcPoints(
          xGL + (barWidth / width),
          -barHeightGL / 2,
          (barWidth / width),
          0,
          Math.PI,
          10
        );
        vertices.push(...bottomArcPoints);
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length / 2);
      gl.flush();

      xOffsetRef.current += 1;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <View style={[styles.container, { width, height }]}>
      <GLView style={{ flex: 1 }} onContextCreate={onContextCreate} />
    </View>
  );
};

const createArcPoints = (
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  segments: number
) => {
  const points: number[] = [];
  const angleStep = (endAngle - startAngle) / segments;

  for (let i = 0; i <= segments; i++) {
    const angle = startAngle + i * angleStep;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push(x, y);
  }

  return points;
};

const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [0, 0, 0];
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});

export default AudioWaveform; 