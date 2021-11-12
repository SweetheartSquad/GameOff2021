precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float whiteout;
uniform float invert;
uniform float curTime;
uniform vec2 camPos;
uniform sampler2D ditherGridMap;
uniform vec3 bg;
uniform vec3 fg;
const vec2 ditherSize = vec2(8.0);
const float scale = 1.0;
const float posterize = 8.0;
const float brightness = 1.0;
const float contrast = 1.0;

void main(void) {
	// get pixels
	vec2 uv = vTextureCoord;
	float t = mod(curTime/1000.0,1000.0);
	
	vec2 coord = gl_FragCoord.xy;
	coord -= mod(coord, scale);

	vec2 uvDither = fract((coord + vec2(0.5)) / (ditherSize.xy * scale));
	vec2 uvPreview = uv;
	float orig = texture2D(uSampler, uvPreview).r;
	float col = (orig - 0.5 + (brightness - 1.0)) * contrast + 0.5;
	float limit = texture2D(ditherGridMap, uvDither).r;
	// posterization
	float raw = col;
	float posterized = raw - mod(raw, 1.0/posterize);
	// dithering
	float dither = step(limit, (raw-posterized)*posterize)/posterize;
	// output
	col = posterized + dither;

	col = mix(col, 1.0, whiteout);
	col = mix(col, 1.0 - col, invert);

	vec3 rgb = mix(bg, fg, col) / 255.0;

	gl_FragColor = vec4(rgb, 1.0);
}
