export default [
  {
    from: 'https://www.shadertoy.com/view/4sXSzs',
    fragment: `
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 p = fragCoord.xy / iResolution.xy;
    vec2 q = p - vec2(0.5, 0.5);

    q.x += sin(iTime* 0.6) * 0.2;
    q.y += cos(iTime* 0.4) * 0.3;

    float len = length(q);

    float a = atan(q.y, q.x) + iTime * 0.3;
    float b = atan(q.y, q.x) + iTime * 0.3;
    float r1 = 0.3 / len + iTime * 0.5;
    float r2 = 0.2 / len + iTime * 0.5;

    float m = (1.0 + sin(iTime * 0.5)) / 2.0;
    vec4 tex1 = texture(iChannel0, vec2(a + 0.1 / len, r1 ));
    vec4 tex2 = texture(iChannel1, vec2(b + 0.1 / len, r2 ));
    vec3 col = vec3(mix(tex1, tex2, m));
    fragColor = vec4(col * len * 1.5, 1.0);
}`
  },
  {
    from: 'https://threejsfundamentals.org/threejs/lessons/threejs-shadertoy.html',
    fragment: `
// By Daedelus: https://www.shadertoy.com/user/Daedelus
// license: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
#define TIMESCALE 0.25 
#define TILES 8
#define COLOR 0.7, 1.6, 2.8

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord.xy / iResolution.xy;
    uv.x *= iResolution.x / iResolution.y;
    
    vec4 noise = texture2D(iChannel0, floor(uv * float(TILES)) / float(TILES));
    float p = 1.0 - mod(noise.r + noise.g + noise.b + iTime * float(TIMESCALE), 1.0);
    p = min(max(p * 3.0 - 1.8, 0.1), 2.0);
    
    vec2 r = mod(uv * float(TILES), 1.0);
    r = vec2(pow(r.x - 0.5, 2.0), pow(r.y - 0.5, 2.0));
    p *= 1.0 - pow(min(1.0, 12.0 * dot(r, r)), 2.0);
    
    fragColor = vec4(COLOR, 1.0) * p;
}
      `
  },
  {
    fragment: `
            uniform vec3 colorA;
          uniform vec3 colorB;
          varying vec3 vUv;
    
          void main() {
            gl_FragColor = vec4(mix(colorA, colorB, vUv.z), 1.0);
          }
            `
  },
  {
    from: 'https://www.shadertoy.com/view/wlVGWd',
    fragment: `
float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u*u*(3.0-2.0*u);

    float res = mix(
        mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
        mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
    return res*res;
}

const mat2 m2 = mat2(0.8,-0.6,0.6,0.8);

float fbm( in vec2 p ){
    float f = 0.0;
    f += 0.5000*noise( p ); p = m2*p*2.02;
    f += 0.2500*noise( p ); p = m2*p*2.03;
    f += 0.1250*noise( p ); p = m2*p*2.01;
    f += 0.0625*noise( p );

    return f/0.769;
}

float pattern( in vec2 p ) {
    vec2 q = vec2(fbm(p + vec2(0.0,0.0)));
    vec2 r = vec2( fbm( p + 4.0*q + vec2(1.7,9.2)));
    r+= iTime * 0.15;
    return fbm( p + 1.760*r );
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
        vec2 uv = fragCoord/iResolution.xy;
    
    uv *= 4.5; // Scale UV to make it nicer in that big screen !
        float displacement = pattern(uv);
        vec4 color = vec4(displacement * 1.2, 0.2, displacement * 5., 1.);
    
    color.a = min(color.r * 0.25, 1.); // Depth for CineShader
    fragColor = color;
}`
  },
  {
    from: 'https://www.shadertoy.com/view/4ttSWf',
    fragment: `
    // Created by inigo quilez - iq/2016
    // License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
    
    
    // Normals are analytical (true derivatives) for the terrain and for the clouds, that 
    // includes the noise, the fbm and the smoothsteps involved chain derivatives correctly.
    //
    // See here for more info: http://iquilezles.org/www/articles/morenoise/morenoise.htm
    //
    // Lighting and art composed for this shot/camera
    //
    // The trees are really cheap (ellipsoids with noise), but they kind of do the job in
    // distance and low image resolutions.
    //
    // I used some cheap reprojection technique to smooth out the render, although it creates
    // halows and blurs the image way too much (I don't have the time now to do the tricks
    // used in TAA). Enable the STATIC_CAMERA define to see a sharper image.
    //
    // Lastly, it runs very slow in WebGL (but runs 2x faster in native GL), so I had to make
    // a youtube capture, sorry for that!
    // 
    // https://www.youtube.com/watch?v=VqYROPZrDeU
    
    
    //#define STATIC_CAMERA
    #define LOWQUALITY
    
    
    
    //==========================================================================================
    // general utilities
    //==========================================================================================
    
    float sdEllipsoidY( in vec3 p, in vec2 r )
    {
        float k0 = length(p/r.xyx);
        float k1 = length(p/(r.xyx*r.xyx));
        return k0*(k0-1.0)/k1;
    }
    
    // return smoothstep and its derivative
    vec2 smoothstepd( float a, float b, float x)
    {
      if( x<a ) return vec2( 0.0, 0.0 );
      if( x>b ) return vec2( 1.0, 0.0 );
        float ir = 1.0/(b-a);
        x = (x-a)*ir;
        return vec2( x*x*(3.0-2.0*x), 6.0*x*(1.0-x)*ir );
    }
    
    mat3 setCamera( in vec3 ro, in vec3 ta, float cr )
    {
      vec3 cw = normalize(ta-ro);
      vec3 cp = vec3(sin(cr), cos(cr),0.0);
      vec3 cu = normalize( cross(cw,cp) );
      vec3 cv = normalize( cross(cu,cw) );
        return mat3( cu, cv, cw );
    }
    
    //==========================================================================================
    // hashes
    //==========================================================================================
    
    float hash1( vec2 p )
    {
        p  = 50.0*fract( p*0.3183099 );
        return fract( p.x*p.y*(p.x+p.y) );
    }
    
    float hash1( float n )
    {
        return fract( n*17.0*fract( n*0.3183099 ) );
    }
    
    vec2 hash2( float n ) { return fract(sin(vec2(n,n+1.0))*vec2(43758.5453123,22578.1459123)); }
    
    
    vec2 hash2( vec2 p ) 
    {
        const vec2 k = vec2( 0.3183099, 0.3678794 );
        p = p*k + k.yx;
        return fract( 16.0 * k*fract( p.x*p.y*(p.x+p.y)) );
    }
    
    //==========================================================================================
    // noises
    //==========================================================================================
    
    // value noise, and its analytical derivatives
    vec4 noised( in vec3 x )
    {
        vec3 p = floor(x);
        vec3 w = fract(x);
        
        vec3 u = w*w*w*(w*(w*6.0-15.0)+10.0);
        vec3 du = 30.0*w*w*(w*(w-2.0)+1.0);
    
        float n = p.x + 317.0*p.y + 157.0*p.z;
        
        float a = hash1(n+0.0);
        float b = hash1(n+1.0);
        float c = hash1(n+317.0);
        float d = hash1(n+318.0);
        float e = hash1(n+157.0);
      float f = hash1(n+158.0);
        float g = hash1(n+474.0);
        float h = hash1(n+475.0);
    
        float k0 =   a;
        float k1 =   b - a;
        float k2 =   c - a;
        float k3 =   e - a;
        float k4 =   a - b - c + d;
        float k5 =   a - c - e + g;
        float k6 =   a - b - e + f;
        float k7 = - a + b + c - d + e - f - g + h;
    
        return vec4( -1.0+2.0*(k0 + k1*u.x + k2*u.y + k3*u.z + k4*u.x*u.y + k5*u.y*u.z + k6*u.z*u.x + k7*u.x*u.y*u.z), 
                          2.0* du * vec3( k1 + k4*u.y + k6*u.z + k7*u.y*u.z,
                                          k2 + k5*u.z + k4*u.x + k7*u.z*u.x,
                                          k3 + k6*u.x + k5*u.y + k7*u.x*u.y ) );
    }
    
    float noise( in vec3 x )
    {
        vec3 p = floor(x);
        vec3 w = fract(x);
        
        vec3 u = w*w*w*(w*(w*6.0-15.0)+10.0);
        
        float n = p.x + 317.0*p.y + 157.0*p.z;
        
        float a = hash1(n+0.0);
        float b = hash1(n+1.0);
        float c = hash1(n+317.0);
        float d = hash1(n+318.0);
        float e = hash1(n+157.0);
      float f = hash1(n+158.0);
        float g = hash1(n+474.0);
        float h = hash1(n+475.0);
    
        float k0 =   a;
        float k1 =   b - a;
        float k2 =   c - a;
        float k3 =   e - a;
        float k4 =   a - b - c + d;
        float k5 =   a - c - e + g;
        float k6 =   a - b - e + f;
        float k7 = - a + b + c - d + e - f - g + h;
    
        return -1.0+2.0*(k0 + k1*u.x + k2*u.y + k3*u.z + k4*u.x*u.y + k5*u.y*u.z + k6*u.z*u.x + k7*u.x*u.y*u.z);
    }
    
    vec3 noised( in vec2 x )
    {
        vec2 p = floor(x);
        vec2 w = fract(x);
        
        vec2 u = w*w*w*(w*(w*6.0-15.0)+10.0);
        vec2 du = 30.0*w*w*(w*(w-2.0)+1.0);
        
        float a = hash1(p+vec2(0,0));
        float b = hash1(p+vec2(1,0));
        float c = hash1(p+vec2(0,1));
        float d = hash1(p+vec2(1,1));
    
        float k0 = a;
        float k1 = b - a;
        float k2 = c - a;
        float k4 = a - b - c + d;
    
        return vec3( -1.0+2.0*(k0 + k1*u.x + k2*u.y + k4*u.x*u.y), 
                          2.0* du * vec2( k1 + k4*u.y,
                                          k2 + k4*u.x ) );
    }
    
    float noise( in vec2 x )
    {
        vec2 p = floor(x);
        vec2 w = fract(x);
        vec2 u = w*w*w*(w*(w*6.0-15.0)+10.0);
        
    #if 0
        p *= 0.3183099;
        float kx0 = 50.0*fract( p.x );
        float kx1 = 50.0*fract( p.x+0.3183099 );
        float ky0 = 50.0*fract( p.y );
        float ky1 = 50.0*fract( p.y+0.3183099 );
    
        float a = fract( kx0*ky0*(kx0+ky0) );
        float b = fract( kx1*ky0*(kx1+ky0) );
        float c = fract( kx0*ky1*(kx0+ky1) );
        float d = fract( kx1*ky1*(kx1+ky1) );
    #else
        float a = hash1(p+vec2(0,0));
        float b = hash1(p+vec2(1,0));
        float c = hash1(p+vec2(0,1));
        float d = hash1(p+vec2(1,1));
    #endif
        
        return -1.0+2.0*( a + (b-a)*u.x + (c-a)*u.y + (a - b - c + d)*u.x*u.y );
    }
    
    //==========================================================================================
    // fbm constructions
    //==========================================================================================
    
    const mat3 m3  = mat3( 0.00,  0.80,  0.60,
                          -0.80,  0.36, -0.48,
                          -0.60, -0.48,  0.64 );
    const mat3 m3i = mat3( 0.00, -0.80, -0.60,
                           0.80,  0.36, -0.48,
                           0.60, -0.48,  0.64 );
    const mat2 m2 = mat2(  0.80,  0.60,
                          -0.60,  0.80 );
    const mat2 m2i = mat2( 0.80, -0.60,
                           0.60,  0.80 );
    
    //------------------------------------------------------------------------------------------
    
    float fbm_4( in vec3 x )
    {
        float f = 2.0;
        float s = 0.5;
        float a = 0.0;
        float b = 0.5;
        for( int i=0; i<4; i++ )
        {
            float n = noise(x);
            a += b*n;
            b *= s;
            x = f*m3*x;
        }
      return a;
    }
    
    vec4 fbmd_8( in vec3 x )
    {
        float f = 1.92;
        float s = 0.5;
        float a = 0.0;
        float b = 0.5;
        vec3  d = vec3(0.0);
        mat3  m = mat3(1.0,0.0,0.0,
                       0.0,1.0,0.0,
                       0.0,0.0,1.0);
        for( int i=0; i<7; i++ )
        {
            vec4 n = noised(x);
            a += b*n.x;          // accumulate values		
            d += b*m*n.yzw;      // accumulate derivatives
            b *= s;
            x = f*m3*x;
            m = f*m3i*m;
        }
      return vec4( a, d );
    }
    
    float fbm_9( in vec2 x )
    {
        float f = 1.9;
        float s = 0.55;
        float a = 0.0;
        float b = 0.5;
        for( int i=0; i<9; i++ )
        {
            float n = noise(x);
            a += b*n;
            b *= s;
            x = f*m2*x;
        }
      return a;
    }
    
    vec3 fbmd_9( in vec2 x )
    {
        float f = 1.9;
        float s = 0.55;
        float a = 0.0;
        float b = 0.5;
        vec2  d = vec2(0.0);
        mat2  m = mat2(1.0,0.0,0.0,1.0);
        for( int i=0; i<9; i++ )
        {
            vec3 n = noised(x);
            a += b*n.x;          // accumulate values		
            d += b*m*n.yz;       // accumulate derivatives
            b *= s;
            x = f*m2*x;
            m = f*m2i*m;
        }
      return vec3( a, d );
    }
    
    float fbm_4( in vec2 x )
    {
        float f = 1.9;
        float s = 0.55;
        float a = 0.0;
        float b = 0.5;
        for( int i=0; i<4; i++ )
        {
            float n = noise(x);
            a += b*n;
            b *= s;
            x = f*m2*x;
        }
      return a;
    }
    
    //==========================================================================================
    
    #define ZERO (min(iFrame,0))
    
    
    //==========================================================================================
    // specifics to the actual painting
    //==========================================================================================
    
    
    //------------------------------------------------------------------------------------------
    // global
    //------------------------------------------------------------------------------------------
    
    const vec3  kSunDir = vec3(-0.624695,0.468521,-0.624695);
    const float kMaxTreeHeight = 2.0;
    const float kMaxHeight = 120.0;
    
    vec3 fog( in vec3 col, float t )
    {
        vec3 fogCol = vec3(0.4,0.6,1.15);
        return mix( col, fogCol, 1.0-exp(-0.000001*t*t) );
    }
    
    
    
    //------------------------------------------------------------------------------------------
    // terrain
    //------------------------------------------------------------------------------------------
    
    vec2 terrainMap( in vec2 p )
    {
        const float sca = 0.0010;
        const float amp = 300.0;
    
        p *= sca;
        float e = fbm_9( p + vec2(1.0,-2.0) );
        float a = 1.0-smoothstep( 0.12, 0.13, abs(e+0.12) ); // flag high-slope areas (-0.25, 0.0)
        e = e + 0.15*smoothstep( -0.08, -0.01, e );
        e *= amp;
        return vec2(e,a);
    }
    
    vec4 terrainMapD( in vec2 p )
    {
      const float sca = 0.0010;
        const float amp = 300.0;
        p *= sca;
        vec3 e = fbmd_9( p + vec2(1.0,-2.0) );
        vec2 c = smoothstepd( -0.08, -0.01, e.x );
      e.x = e.x + 0.15*c.x;
      e.yz = e.yz + 0.15*c.y*e.yz;    
        e.x *= amp;
        e.yz *= amp*sca;
        return vec4( e.x, normalize( vec3(-e.y,1.0,-e.z) ) );
    }
    
    vec3 terrainNormal( in vec2 pos )
    {
    #if 1
        return terrainMapD(pos).yzw;
    #else    
        vec2 e = vec2(0.03,0.0);
      return normalize( vec3(terrainMap(pos-e.xy).x - terrainMap(pos+e.xy).x,
                               2.0*e.x,
                               terrainMap(pos-e.yx).x - terrainMap(pos+e.yx).x ) );
    #endif    
    }
    
    float terrainShadow( in vec3 ro, in vec3 rd, in float mint )
    {
        float res = 1.0;
        float t = mint;
    #ifdef LOWQUALITY
        for( int i=ZERO; i<32; i++ )
        {
            vec3  pos = ro + t*rd;
            vec2  env = terrainMap( pos.xz );
            float hei = pos.y - env.x;
            res = min( res, 32.0*hei/t );
            if( res<0.0001 || pos.y>kMaxHeight ) break;
            t += clamp( hei, 1.0+t*0.1, 50.0 );
        }
    #else
        for( int i=ZERO; i<128; i++ )
        {
            vec3  pos = ro + t*rd;
            vec2  env = terrainMap( pos.xz );
            float hei = pos.y - env.x;
            res = min( res, 32.0*hei/t );
            if( res<0.0001 || pos.y>kMaxHeight  ) break;
            t += clamp( hei, 0.5+t*0.05, 25.0 );
        }
    #endif
        return clamp( res, 0.0, 1.0 );
    }
    
    vec2 raymarchTerrain( in vec3 ro, in vec3 rd, float tmin, float tmax )
    {
        //float tt = (150.0-ro.y)/rd.y; if( tt>0.0 ) tmax = min( tmax, tt );
        
        float dis, th;
        float t2 = -1.0;
        float t = tmin; 
        float ot = t;
        float odis = 0.0;
        float odis2 = 0.0;
        for( int i=ZERO; i<400; i++ )
        {
            th = 0.001*t;
    
            vec3  pos = ro + t*rd;
            vec2  env = terrainMap( pos.xz );
            float hei = env.x;
    
            // tree envelope
            float dis2 = pos.y - (hei+kMaxTreeHeight*1.1);
            if( dis2<th ) 
            {
                if( t2<0.0 )
                {
                    t2 = ot + (th-odis2)*(t-ot)/(dis2-odis2); // linear interpolation for better accuracy
                }
            }
            odis2 = dis2;
            
            // terrain
            dis = pos.y - hei;
            if( dis<th ) break;
            
            ot = t;
            odis = dis;
            t += dis*0.8*(1.0-0.75*env.y); // slow down in step areas
            if( t>tmax || pos.y>kMaxHeight ) break;
        }
    
        if( t>tmax ) t = -1.0;
        else t = ot + (th-odis)*(t-ot)/(dis-odis); // linear interpolation for better accuracy
        return vec2(t,t2);
    }
    
    vec4 renderTerrain( in vec3 ro, in vec3 rd, in vec2 tmima, out float teShadow, out vec2 teDistance, inout float resT )
    {
        vec4 res = vec4(0.0);
        teShadow = 0.0;
        teDistance = vec2(0.0);
        
        vec2 t = raymarchTerrain( ro, rd, tmima.x, tmima.y );
        if( t.x>0.0 )
        {
            vec3 pos = ro + t.x*rd;
            vec3 nor = terrainNormal( pos.xz );
    
            // bump map
            nor = normalize( nor + 0.8*(1.0-abs(nor.y))*0.8*fbmd_8( pos*0.3*vec3(1.0,0.2,1.0) ).yzw );
            
            vec3 col = vec3(0.18,0.11,0.10)*.75;
            col = 1.0*mix( col, vec3(0.1,0.1,0.0)*0.3, smoothstep(0.7,0.9,nor.y) );      
            
        //col *= 1.0 + 2.0*fbm( pos*0.2*vec3(1.0,4.0,1.0) );
            
            float sha = 0.0;
            float dif =  clamp( dot( nor, kSunDir), 0.0, 1.0 ); 
            if( dif>0.0001 ) 
            {
                sha = terrainShadow( pos+nor*0.01, kSunDir, 0.01 );
                //if( sha>0.0001 ) sha *= cloudsShadow( pos+nor*0.01, kSunDir, 0.01, 1000.0 );
                dif *= sha;
            }
            vec3  ref = reflect(rd,nor);
          float bac = clamp( dot(normalize(vec3(-kSunDir.x,0.0,-kSunDir.z)),nor), 0.0, 1.0 )*clamp( (pos.y+100.0)/100.0, 0.0,1.0);
            float dom = clamp( 0.5 + 0.5*nor.y, 0.0, 1.0 );
            vec3  lin  = 1.0*0.2*mix(0.1*vec3(0.1,0.2,0.0),vec3(0.7,0.9,1.0),dom);//pow(vec3(occ),vec3(1.5,0.7,0.5));
                  lin += 1.0*5.0*vec3(1.0,0.9,0.8)*dif;        
                  lin += 1.0*0.35*vec3(1.0)*bac;
            
          col *= lin;
    
            col = fog(col,t.x);
    
            teShadow = sha;
            teDistance = t;
            res = vec4( col, 1.0 );
            resT = t.x;
        }
        
        return res;
    }
    
    //------------------------------------------------------------------------------------------
    // trees
    //------------------------------------------------------------------------------------------
    
    float treesMap( in vec3 p, in float rt, out float oHei, out float oMat, out float oDis )
    {
        oHei = 1.0;
        oDis = 0.1;
        oMat = 0.0;
            
        float base = terrainMap(p.xz).x; 
        
        float d = 10.0;
        vec2 n = floor( p.xz );
        vec2 f = fract( p.xz );
        for( int j=0; j<=1; j++ )
        for( int i=0; i<=1; i++ )
        {
            vec2  g = vec2( float(i), float(j) ) - step(f,vec2(0.5));
            vec2  o = hash2( n + g );
            vec2  v = hash2( n + g + vec2(13.1,71.7) );
            vec2  r = g - f + o;
    
            float height = kMaxTreeHeight * (0.4+0.8*v.x);
            float width = 0.9*(0.5 + 0.2*v.x + 0.3*v.y);
            vec3  q = vec3(r.x,p.y-base-height*0.5,r.y);
            float k = sdEllipsoidY( q, vec2(width,0.5*height) );
    
            if( k<d )
            { 
                d = k;
                //oMat = hash1(o); //fract(o.x*7.0 + o.y*15.0);
                oMat = o.x*7.0 + o.y*15.0;
                oHei = (p.y - base)/height;
                oHei *= 0.5 + 0.5*length(q) / width;
            }
        }
        oMat = fract(oMat);
    
        // distort ellipsoids to make them look like trees (works only in the distance really)
        #ifdef LOWQUALITY
        if( rt<350.0 )
        #else
        if( rt<500.0 )
        #endif
        {
            float s = fbm_4( p*3.0 );
            s = s*s;
            oDis = s;
            #ifdef LOWQUALITY
            float att = 1.0-smoothstep(150.0,350.0,rt);
            #else
            float att = 1.0-smoothstep(200.0,500.0,rt);
            #endif
            d += 2.0*s*att*att;
        }
        
        return d;
    }
    
    float treesShadow( in vec3 ro, in vec3 rd )
    {
        float res = 1.0;
        float t = 0.02;
    #ifdef LOWQUALITY
        for( int i=ZERO; i<50; i++ )
        {
            float kk1, kk2, kk3;
            vec3 pos = ro + rd*t;
            float h = treesMap( pos, t, kk1, kk2, kk3 );
            res = min( res, 32.0*h/t );
            t += h;
            if( res<0.001 || t>20.0 ) break;
        }
    #else
        for( int i=ZERO; i<150; i++ )
        {
            float kk1, kk2, kk3;
            float h = treesMap( ro + rd*t, t, kk1, kk2, kk3 );
            res = min( res, 32.0*h/t );
            t += h;
            if( res<0.001 || t>120.0 ) break;
        }
    #endif
        return clamp( res, 0.0, 1.0 );
    }
    
    vec3 treesNormal( in vec3 pos, in float t )
    {
        float kk1, kk2, kk3;
    #if 0    
        const float eps = 0.005;
        vec2 e = vec2(1.0,-1.0)*0.5773*eps;
        return normalize( e.xyy*treesMap( pos + e.xyy, t, kk1, kk2, kk3 ) + 
                          e.yyx*treesMap( pos + e.yyx, t, kk1, kk2, kk3 ) + 
                          e.yxy*treesMap( pos + e.yxy, t, kk1, kk2, kk3 ) + 
                          e.xxx*treesMap( pos + e.xxx, t, kk1, kk2, kk3 ) );            
    #else
        // inspired by tdhooper and klems - a way to prevent the compiler from inlining map() 4 times
        vec3 n = vec3(0.0);
        for( int i=ZERO; i<4; i++ )
        {
            vec3 e = 0.5773*(2.0*vec3((((i+3)>>1)&1),((i>>1)&1),(i&1))-1.0);
            n += e*treesMap(pos+0.005*e, t, kk1, kk2, kk3);
        }
        return normalize(n);
    #endif    
    }
    
    vec3 treesShade( in vec3 pos, in vec3 tnor, in vec3 enor, in float hei, in float mid, in float dis, in float rt, in vec3 rd, float terrainShadow )
    {
        vec3 nor = normalize( tnor + 2.5*enor );
    
        // --- lighting ---
        float sha = terrainShadow;
        vec3  ref = reflect(rd,nor);
        float occ = clamp(hei,0.0,1.0) * pow(1.0-2.0*dis,3.0);
        float dif = clamp( 0.1 + 0.9*dot( nor, kSunDir), 0.0, 1.0 ); 
        if( dif>0.0001 && terrainShadow>0.001 )
        {
            //sha *= clamp( 10.0*dot(tnor,kSunDir), 0.0, 1.0 ) * pow(clamp(1.0-13.0*dis,0.0,1.0),4.0);//treesShadow( pos+nor*0.1, kSunDir ); // only cast in non-terrain-occluded areas
            sha *= treesShadow( pos+nor*0.1, kSunDir ); // only cast in non-terrain-occluded areas
        }
        float dom = clamp( 0.5 + 0.5*nor.y, 0.0, 1.0 );
        float fre = clamp(1.0+dot(nor,rd),0.0,1.0);
        float spe = pow( clamp(dot(ref,kSunDir),0.0, 1.0), 9.0 )*dif*sha*(0.2+0.8*pow(fre,5.0))*occ;
    
        // --- lights ---
        vec3 lin  = 1.0*0.5*mix(0.1*vec3(0.1,0.2,0.0),vec3(0.6,1.0,1.0),dom*occ);
         #ifdef SOFTTREES
             lin += 1.0*15.0*vec3(1.0,0.9,0.8)*dif*occ*sha;
         #else
             lin += 1.0*10.0*vec3(1.0,0.9,0.8)*dif*occ*sha;
         #endif
             lin += 1.0*vec3(0.9,1.0,0.8)*pow(fre,5.0)*occ;
             lin += 0.05*vec3(0.15,0.4,0.1)*occ;
       
        // --- material ---
        float brownAreas = fbm_4( pos.zx*0.03 );
        vec3 col = vec3(0.08,0.09,0.02);
           col = mix( col, vec3(0.09,0.07,0.02), smoothstep(0.2,1.0,mid) );
             col = mix( col, vec3(0.06,0.05,0.01)*1.1, 1.0-smoothstep(0.9,0.91,enor.y) );
             col = mix( col, vec3(0.25,0.16,0.01)*0.15, 0.7*smoothstep(0.1,0.3,brownAreas)*smoothstep(0.5,0.8,enor.y) );
             col *= 1.6;
    
        // --- brdf * material ---
        col *= lin;
        col += spe*1.2*vec3(1.0,1.1,2.5);
    
        // --- fog ---
        col = fog( col, rt );
      
        return col;
    }
    
    vec4 renderTrees( in vec3 ro, in vec3 rd, float tmin, float tmax, float terrainShadow, inout float resT )
    {
      //if( tmin>300.0 ) return vec4(0.0);
        float t = tmin;
        float hei, mid, displa;
    
        for(int i=ZERO; i<64; i++) 
        { 
            vec3  pos = ro + t*rd; 
            float dis = treesMap( pos, t, hei, mid, displa); 
            if( dis<(0.00025*t) ) break;
            t += dis;
            if( t>tmax ) return vec4(0.0);
        }
        
        vec3 pos = ro + t*rd;
    
        vec3 enor = terrainNormal( pos.xz );
        vec3 tnor = treesNormal( pos, t );            
    
        vec3 col = treesShade( pos, tnor, enor, hei, mid, displa, t, rd, terrainShadow );
      resT = t;
        
        return vec4(col,1.0);
    }
    
    
    //------------------------------------------------------------------------------------------
    // main image making function
    //------------------------------------------------------------------------------------------
    
    void mainImage( out vec4 fragColor, in vec2 fragCoord )
    {
        vec2 o = hash2( float(iFrame) ) - 0.5;
        
        vec2 p = (-iResolution.xy + 2.0*(fragCoord+o))/ iResolution.y;
        
        //----------------------------------
        // setup
        //----------------------------------
    
        // camera
        float time = 0.0;
 
        vec3 ro = vec3(0.0, -99.25, 5.0) + vec3(10.0*sin(0.02*time),0.0,-10.0*sin(0.2+0.031*time));
        vec3 ta = vec3(0.0, -98.25, -45.0 + ro.z );
        
        // ray
        mat3 ca = setCamera( ro, ta, 0.0 );
        vec3 rd = ca * normalize( vec3(p,1.5));
    
      float resT = 1000.0;
    
        //----------------------------------
        // sky
        //----------------------------------
    
        vec3 col = vec3(0.0, -98.25, -45.0 + ro.z );
        
        //----------------------------------
        // terrain
        //----------------------------------
        vec2 teDistance;
        float teShadow;
        
        vec2 tmima = vec2(15.0,1000.0);
        {
            vec4 res = renderTerrain( ro, rd, tmima, teShadow, teDistance, resT );
            col = col*(1.0-res.w) + res.xyz;
        }                        
    
        //----------------------------------
        // trees
        //----------------------------------
        if( teDistance.y>0.0 )
        {
            tmima = vec2( teDistance.y, (teDistance.x>0.0)?teDistance.x:tmima.y );
            vec4 res = renderTrees( ro, rd, tmima.x, tmima.y, teShadow, resT );
            col = col*(1.0-res.w) + res.xyz;
        }
    
        //----------------------------------
        // clouds
        //----------------------------------
        
        //----------------------------------
        // final
        //----------------------------------
        
        // sun glare    
        float sun = clamp( dot(kSunDir,rd), 0.0, 1.0 );
        col += 0.25*vec3(1.0,0.4,0.2)*pow( sun, 4.0 );
     
        // gamma
        col = sqrt(col);
    
        //----------------------------------
        // color grading
        //----------------------------------
    
        col = col*0.15 + 0.85*col*col*(3.0-2.0*col);            // contrast
        col = pow( col, vec3(1.0,0.92,1.0) );   // soft green
        col *= vec3(1.02,0.99,0.99);            // tint red
        col.z = (col.z+0.1)/1.1;                // bias blue
        col = mix( col, col.yyy, 0.15 );       // desaturate
         
        col = clamp( col, 0.0, 1.0 );
        
        
        
            fragColor = vec4( col, 1.0 );
        
    }
`
  },
  {
    from: 'https://www.shadertoy.com/view/4ttSWf',
    fragment: `
    // Created by inigo quilez - iq/2016
    // License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
    
    
    // Normals are analytical (true derivatives) for the terrain and for the clouds, that 
    // includes the noise, the fbm and the smoothsteps involved chain derivatives correctly.
    //
    // See here for more info: http://iquilezles.org/www/articles/morenoise/morenoise.htm
    //
    // Lighting and art composed for this shot/camera
    //
    // The trees are really cheap (ellipsoids with noise), but they kind of do the job in
    // distance and low image resolutions.
    //
    // I used some cheap reprojection technique to smooth out the render, although it creates
    // halows and blurs the image way too much (I don't have the time now to do the tricks
    // used in TAA). Enable the STATIC_CAMERA define to see a sharper image.
    //
    // Lastly, it runs very slow in WebGL (but runs 2x faster in native GL), so I had to make
    // a youtube capture, sorry for that!
    // 
    // https://www.youtube.com/watch?v=VqYROPZrDeU
    
    
    //#define STATIC_CAMERA
    #define LOWQUALITY
    
    
    
    //==========================================================================================
    // general utilities
    //==========================================================================================
    
    float sdEllipsoidY( in vec3 p, in vec2 r )
    {
        float k0 = length(p/r.xyx);
        float k1 = length(p/(r.xyx*r.xyx));
        return k0*(k0-1.0)/k1;
    }
    
    // return smoothstep and its derivative
    vec2 smoothstepd( float a, float b, float x)
    {
      if( x<a ) return vec2( 0.0, 0.0 );
      if( x>b ) return vec2( 1.0, 0.0 );
        float ir = 1.0/(b-a);
        x = (x-a)*ir;
        return vec2( x*x*(3.0-2.0*x), 6.0*x*(1.0-x)*ir );
    }
    
    mat3 setCamera( in vec3 ro, in vec3 ta, float cr )
    {
      vec3 cw = normalize(ta-ro);
      vec3 cp = vec3(sin(cr), cos(cr),0.0);
      vec3 cu = normalize( cross(cw,cp) );
      vec3 cv = normalize( cross(cu,cw) );
        return mat3( cu, cv, cw );
    }
    
    //==========================================================================================
    // hashes
    //==========================================================================================
    
    float hash1( vec2 p )
    {
        p  = 50.0*fract( p*0.3183099 );
        return fract( p.x*p.y*(p.x+p.y) );
    }
    
    float hash1( float n )
    {
        return fract( n*17.0*fract( n*0.3183099 ) );
    }
    
    vec2 hash2( float n ) { return fract(sin(vec2(n,n+1.0))*vec2(43758.5453123,22578.1459123)); }
    
    
    vec2 hash2( vec2 p ) 
    {
        const vec2 k = vec2( 0.3183099, 0.3678794 );
        p = p*k + k.yx;
        return fract( 16.0 * k*fract( p.x*p.y*(p.x+p.y)) );
    }
    
    //==========================================================================================
    // noises
    //==========================================================================================
    
    // value noise, and its analytical derivatives
    vec4 noised( in vec3 x )
    {
        vec3 p = floor(x);
        vec3 w = fract(x);
        
        vec3 u = w*w*w*(w*(w*6.0-15.0)+10.0);
        vec3 du = 30.0*w*w*(w*(w-2.0)+1.0);
    
        float n = p.x + 317.0*p.y + 157.0*p.z;
        
        float a = hash1(n+0.0);
        float b = hash1(n+1.0);
        float c = hash1(n+317.0);
        float d = hash1(n+318.0);
        float e = hash1(n+157.0);
      float f = hash1(n+158.0);
        float g = hash1(n+474.0);
        float h = hash1(n+475.0);
    
        float k0 =   a;
        float k1 =   b - a;
        float k2 =   c - a;
        float k3 =   e - a;
        float k4 =   a - b - c + d;
        float k5 =   a - c - e + g;
        float k6 =   a - b - e + f;
        float k7 = - a + b + c - d + e - f - g + h;
    
        return vec4( -1.0+2.0*(k0 + k1*u.x + k2*u.y + k3*u.z + k4*u.x*u.y + k5*u.y*u.z + k6*u.z*u.x + k7*u.x*u.y*u.z), 
                          2.0* du * vec3( k1 + k4*u.y + k6*u.z + k7*u.y*u.z,
                                          k2 + k5*u.z + k4*u.x + k7*u.z*u.x,
                                          k3 + k6*u.x + k5*u.y + k7*u.x*u.y ) );
    }
    
    float noise( in vec3 x )
    {
        vec3 p = floor(x);
        vec3 w = fract(x);
        
        vec3 u = w*w*w*(w*(w*6.0-15.0)+10.0);
        
        float n = p.x + 317.0*p.y + 157.0*p.z;
        
        float a = hash1(n+0.0);
        float b = hash1(n+1.0);
        float c = hash1(n+317.0);
        float d = hash1(n+318.0);
        float e = hash1(n+157.0);
      float f = hash1(n+158.0);
        float g = hash1(n+474.0);
        float h = hash1(n+475.0);
    
        float k0 =   a;
        float k1 =   b - a;
        float k2 =   c - a;
        float k3 =   e - a;
        float k4 =   a - b - c + d;
        float k5 =   a - c - e + g;
        float k6 =   a - b - e + f;
        float k7 = - a + b + c - d + e - f - g + h;
    
        return -1.0+2.0*(k0 + k1*u.x + k2*u.y + k3*u.z + k4*u.x*u.y + k5*u.y*u.z + k6*u.z*u.x + k7*u.x*u.y*u.z);
    }
    
    vec3 noised( in vec2 x )
    {
        vec2 p = floor(x);
        vec2 w = fract(x);
        
        vec2 u = w*w*w*(w*(w*6.0-15.0)+10.0);
        vec2 du = 30.0*w*w*(w*(w-2.0)+1.0);
        
        float a = hash1(p+vec2(0,0));
        float b = hash1(p+vec2(1,0));
        float c = hash1(p+vec2(0,1));
        float d = hash1(p+vec2(1,1));
    
        float k0 = a;
        float k1 = b - a;
        float k2 = c - a;
        float k4 = a - b - c + d;
    
        return vec3( -1.0+2.0*(k0 + k1*u.x + k2*u.y + k4*u.x*u.y), 
                          2.0* du * vec2( k1 + k4*u.y,
                                          k2 + k4*u.x ) );
    }
    
    float noise( in vec2 x )
    {
        vec2 p = floor(x);
        vec2 w = fract(x);
        vec2 u = w*w*w*(w*(w*6.0-15.0)+10.0);
        
    #if 0
        p *= 0.3183099;
        float kx0 = 50.0*fract( p.x );
        float kx1 = 50.0*fract( p.x+0.3183099 );
        float ky0 = 50.0*fract( p.y );
        float ky1 = 50.0*fract( p.y+0.3183099 );
    
        float a = fract( kx0*ky0*(kx0+ky0) );
        float b = fract( kx1*ky0*(kx1+ky0) );
        float c = fract( kx0*ky1*(kx0+ky1) );
        float d = fract( kx1*ky1*(kx1+ky1) );
    #else
        float a = hash1(p+vec2(0,0));
        float b = hash1(p+vec2(1,0));
        float c = hash1(p+vec2(0,1));
        float d = hash1(p+vec2(1,1));
    #endif
        
        return -1.0+2.0*( a + (b-a)*u.x + (c-a)*u.y + (a - b - c + d)*u.x*u.y );
    }
    
    //==========================================================================================
    // fbm constructions
    //==========================================================================================
    
    const mat3 m3  = mat3( 0.00,  0.80,  0.60,
                          -0.80,  0.36, -0.48,
                          -0.60, -0.48,  0.64 );
    const mat3 m3i = mat3( 0.00, -0.80, -0.60,
                           0.80,  0.36, -0.48,
                           0.60, -0.48,  0.64 );
    const mat2 m2 = mat2(  0.80,  0.60,
                          -0.60,  0.80 );
    const mat2 m2i = mat2( 0.80, -0.60,
                           0.60,  0.80 );
    
    //------------------------------------------------------------------------------------------
    
    float fbm_4( in vec3 x )
    {
        float f = 2.0;
        float s = 0.5;
        float a = 0.0;
        float b = 0.5;
        for( int i=0; i<4; i++ )
        {
            float n = noise(x);
            a += b*n;
            b *= s;
            x = f*m3*x;
        }
      return a;
    }
    
    vec4 fbmd_8( in vec3 x )
    {
        float f = 1.92;
        float s = 0.5;
        float a = 0.0;
        float b = 0.5;
        vec3  d = vec3(0.0);
        mat3  m = mat3(1.0,0.0,0.0,
                       0.0,1.0,0.0,
                       0.0,0.0,1.0);
        for( int i=0; i<7; i++ )
        {
            vec4 n = noised(x);
            a += b*n.x;          // accumulate values		
            d += b*m*n.yzw;      // accumulate derivatives
            b *= s;
            x = f*m3*x;
            m = f*m3i*m;
        }
      return vec4( a, d );
    }
    
    float fbm_9( in vec2 x )
    {
        float f = 1.9;
        float s = 0.55;
        float a = 0.0;
        float b = 0.5;
        for( int i=0; i<9; i++ )
        {
            float n = noise(x);
            a += b*n;
            b *= s;
            x = f*m2*x;
        }
      return a;
    }
    
    vec3 fbmd_9( in vec2 x )
    {
        float f = 1.9;
        float s = 0.55;
        float a = 0.0;
        float b = 0.5;
        vec2  d = vec2(0.0);
        mat2  m = mat2(1.0,0.0,0.0,1.0);
        for( int i=0; i<9; i++ )
        {
            vec3 n = noised(x);
            a += b*n.x;          // accumulate values		
            d += b*m*n.yz;       // accumulate derivatives
            b *= s;
            x = f*m2*x;
            m = f*m2i*m;
        }
      return vec3( a, d );
    }
    
    float fbm_4( in vec2 x )
    {
        float f = 1.9;
        float s = 0.55;
        float a = 0.0;
        float b = 0.5;
        for( int i=0; i<4; i++ )
        {
            float n = noise(x);
            a += b*n;
            b *= s;
            x = f*m2*x;
        }
      return a;
    }
    
    //==========================================================================================
    
    #define ZERO (min(iFrame,0))
    
    
    //==========================================================================================
    // specifics to the actual painting
    //==========================================================================================
    
    
    //------------------------------------------------------------------------------------------
    // global
    //------------------------------------------------------------------------------------------
    
    const vec3  kSunDir = vec3(-0.624695,0.468521,-0.624695);
    const float kMaxTreeHeight = 2.0;
    const float kMaxHeight = 120.0;
    
    vec3 fog( in vec3 col, float t )
    {
        vec3 fogCol = vec3(0.4,0.6,1.15);
        return mix( col, fogCol, 1.0-exp(-0.000001*t*t) );
    }
    
    
    
    //------------------------------------------------------------------------------------------
    // terrain
    //------------------------------------------------------------------------------------------
    
    vec2 terrainMap( in vec2 p )
    {
        const float sca = 0.0010;
        const float amp = 300.0;
    
        p *= sca;
        float e = fbm_9( p + vec2(1.0,-2.0) );
        float a = 1.0-smoothstep( 0.12, 0.13, abs(e+0.12) ); // flag high-slope areas (-0.25, 0.0)
        e = e + 0.15*smoothstep( -0.08, -0.01, e );
        e *= amp;
        return vec2(e,a);
    }
    
    vec4 terrainMapD( in vec2 p )
    {
      const float sca = 0.0010;
        const float amp = 300.0;
        p *= sca;
        vec3 e = fbmd_9( p + vec2(1.0,-2.0) );
        vec2 c = smoothstepd( -0.08, -0.01, e.x );
      e.x = e.x + 0.15*c.x;
      e.yz = e.yz + 0.15*c.y*e.yz;    
        e.x *= amp;
        e.yz *= amp*sca;
        return vec4( e.x, normalize( vec3(-e.y,1.0,-e.z) ) );
    }
    
    vec3 terrainNormal( in vec2 pos )
    {
    #if 1
        return terrainMapD(pos).yzw;
    #else    
        vec2 e = vec2(0.03,0.0);
      return normalize( vec3(terrainMap(pos-e.xy).x - terrainMap(pos+e.xy).x,
                               2.0*e.x,
                               terrainMap(pos-e.yx).x - terrainMap(pos+e.yx).x ) );
    #endif    
    }
    
    float terrainShadow( in vec3 ro, in vec3 rd, in float mint )
    {
        float res = 1.0;
        float t = mint;
    #ifdef LOWQUALITY
        for( int i=ZERO; i<32; i++ )
        {
            vec3  pos = ro + t*rd;
            vec2  env = terrainMap( pos.xz );
            float hei = pos.y - env.x;
            res = min( res, 32.0*hei/t );
            if( res<0.0001 || pos.y>kMaxHeight ) break;
            t += clamp( hei, 1.0+t*0.1, 50.0 );
        }
    #else
        for( int i=ZERO; i<128; i++ )
        {
            vec3  pos = ro + t*rd;
            vec2  env = terrainMap( pos.xz );
            float hei = pos.y - env.x;
            res = min( res, 32.0*hei/t );
            if( res<0.0001 || pos.y>kMaxHeight  ) break;
            t += clamp( hei, 0.5+t*0.05, 25.0 );
        }
    #endif
        return clamp( res, 0.0, 1.0 );
    }
    
    vec2 raymarchTerrain( in vec3 ro, in vec3 rd, float tmin, float tmax )
    {
        //float tt = (150.0-ro.y)/rd.y; if( tt>0.0 ) tmax = min( tmax, tt );
        
        float dis, th;
        float t2 = -1.0;
        float t = tmin; 
        float ot = t;
        float odis = 0.0;
        float odis2 = 0.0;
        for( int i=ZERO; i<400; i++ )
        {
            th = 0.001*t;
    
            vec3  pos = ro + t*rd;
            vec2  env = terrainMap( pos.xz );
            float hei = env.x;
    
            // tree envelope
            float dis2 = pos.y - (hei+kMaxTreeHeight*1.1);
            if( dis2<th ) 
            {
                if( t2<0.0 )
                {
                    t2 = ot + (th-odis2)*(t-ot)/(dis2-odis2); // linear interpolation for better accuracy
                }
            }
            odis2 = dis2;
            
            // terrain
            dis = pos.y - hei;
            if( dis<th ) break;
            
            ot = t;
            odis = dis;
            t += dis*0.8*(1.0-0.75*env.y); // slow down in step areas
            if( t>tmax || pos.y>kMaxHeight ) break;
        }
    
        if( t>tmax ) t = -1.0;
        else t = ot + (th-odis)*(t-ot)/(dis-odis); // linear interpolation for better accuracy
        return vec2(t,t2);
    }
    
    vec4 renderTerrain( in vec3 ro, in vec3 rd, in vec2 tmima, out float teShadow, out vec2 teDistance, inout float resT )
    {
        vec4 res = vec4(0.0);
        teShadow = 0.0;
        teDistance = vec2(0.0);
        
        vec2 t = raymarchTerrain( ro, rd, tmima.x, tmima.y );
        if( t.x>0.0 )
        {
            vec3 pos = ro + t.x*rd;
            vec3 nor = terrainNormal( pos.xz );
    
            // bump map
            nor = normalize( nor + 0.8*(1.0-abs(nor.y))*0.8*fbmd_8( pos*0.3*vec3(1.0,0.2,1.0) ).yzw );
            
            vec3 col = vec3(0.18,0.11,0.10)*.75;
            col = 1.0*mix( col, vec3(0.1,0.1,0.0)*0.3, smoothstep(0.7,0.9,nor.y) );      
            
        //col *= 1.0 + 2.0*fbm( pos*0.2*vec3(1.0,4.0,1.0) );
            
            float sha = 0.0;
            float dif =  clamp( dot( nor, kSunDir), 0.0, 1.0 ); 
            if( dif>0.0001 ) 
            {
                sha = terrainShadow( pos+nor*0.01, kSunDir, 0.01 );
                //if( sha>0.0001 ) sha *= cloudsShadow( pos+nor*0.01, kSunDir, 0.01, 1000.0 );
                dif *= sha;
            }
            vec3  ref = reflect(rd,nor);
          float bac = clamp( dot(normalize(vec3(-kSunDir.x,0.0,-kSunDir.z)),nor), 0.0, 1.0 )*clamp( (pos.y+100.0)/100.0, 0.0,1.0);
            float dom = clamp( 0.5 + 0.5*nor.y, 0.0, 1.0 );
            vec3  lin  = 1.0*0.2*mix(0.1*vec3(0.1,0.2,0.0),vec3(0.7,0.9,1.0),dom);//pow(vec3(occ),vec3(1.5,0.7,0.5));
                  lin += 1.0*5.0*vec3(1.0,0.9,0.8)*dif;        
                  lin += 1.0*0.35*vec3(1.0)*bac;
            
          col *= lin;
    
            col = fog(col,t.x);
    
            teShadow = sha;
            teDistance = t;
            res = vec4( col, 1.0 );
            resT = t.x;
        }
        
        return res;
    }
    
    //------------------------------------------------------------------------------------------
    // trees
    //------------------------------------------------------------------------------------------
    
    float treesMap( in vec3 p, in float rt, out float oHei, out float oMat, out float oDis )
    {
        oHei = 1.0;
        oDis = 0.1;
        oMat = 0.0;
            
        float base = terrainMap(p.xz).x; 
        
        float d = 10.0;
        vec2 n = floor( p.xz );
        vec2 f = fract( p.xz );
        for( int j=0; j<=1; j++ )
        for( int i=0; i<=1; i++ )
        {
            vec2  g = vec2( float(i), float(j) ) - step(f,vec2(0.5));
            vec2  o = hash2( n + g );
            vec2  v = hash2( n + g + vec2(13.1,71.7) );
            vec2  r = g - f + o;
    
            float height = kMaxTreeHeight * (0.4+0.8*v.x);
            float width = 0.9*(0.5 + 0.2*v.x + 0.3*v.y);
            vec3  q = vec3(r.x,p.y-base-height*0.5,r.y);
            float k = sdEllipsoidY( q, vec2(width,0.5*height) );
    
            if( k<d )
            { 
                d = k;
                //oMat = hash1(o); //fract(o.x*7.0 + o.y*15.0);
                oMat = o.x*7.0 + o.y*15.0;
                oHei = (p.y - base)/height;
                oHei *= 0.5 + 0.5*length(q) / width;
            }
        }
        oMat = fract(oMat);
    
        // distort ellipsoids to make them look like trees (works only in the distance really)
        #ifdef LOWQUALITY
        if( rt<350.0 )
        #else
        if( rt<500.0 )
        #endif
        {
            float s = fbm_4( p*3.0 );
            s = s*s;
            oDis = s;
            #ifdef LOWQUALITY
            float att = 1.0-smoothstep(150.0,350.0,rt);
            #else
            float att = 1.0-smoothstep(200.0,500.0,rt);
            #endif
            d += 2.0*s*att*att;
        }
        
        return d;
    }
    
    float treesShadow( in vec3 ro, in vec3 rd )
    {
        float res = 1.0;
        float t = 0.02;
    #ifdef LOWQUALITY
        for( int i=ZERO; i<50; i++ )
        {
            float kk1, kk2, kk3;
            vec3 pos = ro + rd*t;
            float h = treesMap( pos, t, kk1, kk2, kk3 );
            res = min( res, 32.0*h/t );
            t += h;
            if( res<0.001 || t>20.0 ) break;
        }
    #else
        for( int i=ZERO; i<150; i++ )
        {
            float kk1, kk2, kk3;
            float h = treesMap( ro + rd*t, t, kk1, kk2, kk3 );
            res = min( res, 32.0*h/t );
            t += h;
            if( res<0.001 || t>120.0 ) break;
        }
    #endif
        return clamp( res, 0.0, 1.0 );
    }
    
    vec3 treesNormal( in vec3 pos, in float t )
    {
        float kk1, kk2, kk3;
    #if 0    
        const float eps = 0.005;
        vec2 e = vec2(1.0,-1.0)*0.5773*eps;
        return normalize( e.xyy*treesMap( pos + e.xyy, t, kk1, kk2, kk3 ) + 
                          e.yyx*treesMap( pos + e.yyx, t, kk1, kk2, kk3 ) + 
                          e.yxy*treesMap( pos + e.yxy, t, kk1, kk2, kk3 ) + 
                          e.xxx*treesMap( pos + e.xxx, t, kk1, kk2, kk3 ) );            
    #else
        // inspired by tdhooper and klems - a way to prevent the compiler from inlining map() 4 times
        vec3 n = vec3(0.0);
        for( int i=ZERO; i<4; i++ )
        {
            vec3 e = 0.5773*(2.0*vec3((((i+3)>>1)&1),((i>>1)&1),(i&1))-1.0);
            n += e*treesMap(pos+0.005*e, t, kk1, kk2, kk3);
        }
        return normalize(n);
    #endif    
    }
    
    vec3 treesShade( in vec3 pos, in vec3 tnor, in vec3 enor, in float hei, in float mid, in float dis, in float rt, in vec3 rd, float terrainShadow )
    {
        vec3 nor = normalize( tnor + 2.5*enor );
    
        // --- lighting ---
        float sha = terrainShadow;
        vec3  ref = reflect(rd,nor);
        float occ = clamp(hei,0.0,1.0) * pow(1.0-2.0*dis,3.0);
        float dif = clamp( 0.1 + 0.9*dot( nor, kSunDir), 0.0, 1.0 ); 
        if( dif>0.0001 && terrainShadow>0.001 )
        {
            //sha *= clamp( 10.0*dot(tnor,kSunDir), 0.0, 1.0 ) * pow(clamp(1.0-13.0*dis,0.0,1.0),4.0);//treesShadow( pos+nor*0.1, kSunDir ); // only cast in non-terrain-occluded areas
            sha *= treesShadow( pos+nor*0.1, kSunDir ); // only cast in non-terrain-occluded areas
        }
        float dom = clamp( 0.5 + 0.5*nor.y, 0.0, 1.0 );
        float fre = clamp(1.0+dot(nor,rd),0.0,1.0);
        float spe = pow( clamp(dot(ref,kSunDir),0.0, 1.0), 9.0 )*dif*sha*(0.2+0.8*pow(fre,5.0))*occ;
    
        // --- lights ---
        vec3 lin  = 1.0*0.5*mix(0.1*vec3(0.1,0.2,0.0),vec3(0.6,1.0,1.0),dom*occ);
         #ifdef SOFTTREES
             lin += 1.0*15.0*vec3(1.0,0.9,0.8)*dif*occ*sha;
         #else
             lin += 1.0*10.0*vec3(1.0,0.9,0.8)*dif*occ*sha;
         #endif
             lin += 1.0*vec3(0.9,1.0,0.8)*pow(fre,5.0)*occ;
             lin += 0.05*vec3(0.15,0.4,0.1)*occ;
       
        // --- material ---
        float brownAreas = fbm_4( pos.zx*0.03 );
        vec3 col = vec3(0.08,0.09,0.02);
           col = mix( col, vec3(0.09,0.07,0.02), smoothstep(0.2,1.0,mid) );
             col = mix( col, vec3(0.06,0.05,0.01)*1.1, 1.0-smoothstep(0.9,0.91,enor.y) );
             col = mix( col, vec3(0.25,0.16,0.01)*0.15, 0.7*smoothstep(0.1,0.3,brownAreas)*smoothstep(0.5,0.8,enor.y) );
             col *= 1.6;
    
        // --- brdf * material ---
        col *= lin;
        col += spe*1.2*vec3(1.0,1.1,2.5);
    
        // --- fog ---
        col = fog( col, rt );
      
        return col;
    }
    
    vec4 renderTrees( in vec3 ro, in vec3 rd, float tmin, float tmax, float terrainShadow, inout float resT )
    {
      //if( tmin>300.0 ) return vec4(0.0);
        float t = tmin;
        float hei, mid, displa;
    
        for(int i=ZERO; i<64; i++) 
        { 
            vec3  pos = ro + t*rd; 
            float dis = treesMap( pos, t, hei, mid, displa); 
            if( dis<(0.00025*t) ) break;
            t += dis;
            if( t>tmax ) return vec4(0.0);
        }
        
        vec3 pos = ro + t*rd;
    
        vec3 enor = terrainNormal( pos.xz );
        vec3 tnor = treesNormal( pos, t );            
    
        vec3 col = treesShade( pos, tnor, enor, hei, mid, displa, t, rd, terrainShadow );
      resT = t;
        
        return vec4(col,1.0);
    }
    
    
    //------------------------------------------------------------------------------------------
    // main image making function
    //------------------------------------------------------------------------------------------
    
    void mainImage( out vec4 fragColor, in vec2 fragCoord )
    {
        vec2 o = hash2( float(iFrame) ) - 0.5;
        
        vec2 p = (-iResolution.xy + 2.0*(fragCoord+o))/ iResolution.y;
        
        //----------------------------------
        // setup
        //----------------------------------
    
        // camera
        float time = 0.0;
 
        vec3 ro = vec3(0.0, -99.25, 5.0) + vec3(10.0*sin(0.02*time),0.0,-10.0*sin(0.2+0.031*time));
        vec3 ta = vec3(0.0, -98.25, -45.0 + ro.z );
        
        // ray
        mat3 ca = setCamera( ro, ta, 0.0 );
        vec3 rd = ca * normalize( vec3(p,1.5));
    
      float resT = 1000.0;
    
        //----------------------------------
        // sky
        //----------------------------------
    
        vec3 col = vec3(0.0, -98.25, -45.0 + ro.z );
        
        //----------------------------------
        // terrain
        //----------------------------------
        vec2 teDistance;
        float teShadow;
        
        vec2 tmima = vec2(15.0,1000.0);
        {
            vec4 res = renderTerrain( ro, rd, tmima, teShadow, teDistance, resT );
            col = col*(1.0-res.w) + res.xyz;
        }                        
    
        //----------------------------------
        // trees
        //----------------------------------
        if( teDistance.y>0.0 )
        {
            tmima = vec2( teDistance.y, (teDistance.x>0.0)?teDistance.x:tmima.y );
            vec4 res = renderTrees( ro, rd, tmima.x, tmima.y, teShadow, resT );
            col = col*(1.0-res.w) + res.xyz;
        }
    
        //----------------------------------
        // clouds
        //----------------------------------
        
        //----------------------------------
        // final
        //----------------------------------
        
        // sun glare    
        float sun = clamp( dot(kSunDir,rd), 0.0, 1.0 );
        col += 0.25*vec3(1.0,0.4,0.2)*pow( sun, 4.0 );
     
        // gamma
        col = sqrt(col);
    
        //----------------------------------
        // color grading
        //----------------------------------
    
        col = col*0.15 + 0.85*col*col*(3.0-2.0*col);            // contrast
        col = pow( col, vec3(1.0,0.92,1.0) );   // soft green
        col *= vec3(1.02,0.99,0.99);            // tint red
        col.z = (col.z+0.1)/1.1;                // bias blue
        col = mix( col, col.yyy, 0.15 );       // desaturate
         
        col = clamp( col, 0.0, 1.0 );
        
        
        
            fragColor = vec4( col, 1.0 );
        
    }
` },
  {
    from: 'https://www.shadertoy.com/view/MdlGW7',
    fragment:
      `
      // Created by inigo quilez - iq/2013
      // License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
      
      float noise( in vec3 x )
      {
          vec3 p = floor(x);
          vec3 f = fract(x);
      
          float a = textureLod( iChannel0, x.xy/256.0 + (p.z+0.0)*120.7123, 0.0 ).x;
          float b = textureLod( iChannel0, x.xy/256.0 + (p.z+1.0)*120.7123, 0.0 ).x;
        return mix( a, b, f.z );
      }
      
      
      const mat3 m = mat3( 0.00,  0.80,  0.60,
                          -0.80,  0.36, -0.48,
                          -0.60, -0.48,  0.64 );
      
      float fbm( vec3 p )
      {
          float f;
          f  = 0.5000*noise( p ); p = m*p*2.02;
          f += 0.2500*noise( p ); p = m*p*2.03;
          f += 0.1250*noise( p ); p = m*p*2.01;
          f += 0.0625*noise( p );
          return f;
      }
      
      float envelope( vec3 p )
      {
        float isLake = 1.0-smoothstep( 0.62, 0.72, textureLod( iChannel0, 0.001*p.zx, 0.0).x );
        return 0.1 + isLake*0.9*textureLod( iChannel1, 0.01*p.xz, 0.0 ).x;
      }
      
      float mapTerrain( in vec3 pos )
      {
        return pos.y - envelope(pos);
      }
      
      float raymarchTerrain( in vec3 ro, in vec3 rd )
      {
        float maxd = 50.0;
        float precis = 0.001;
          float h = 1.0;
          float t = 0.0;
          for( int i=0; i<80; i++ )
          {
              if( abs(h)<precis||t>maxd ) break;
              t += h;
            h = mapTerrain( ro+rd*t );
          }
      
          if( t>maxd ) t=-1.0;
          return t;
      }
      
      vec3 lig = normalize( vec3(0.7,0.4,0.2) );
      
      vec3 calcNormal( in vec3 pos )
      {
          vec3 eps = vec3(0.02,0.0,0.0);
        return normalize( vec3(
                 mapTerrain(pos+eps.xyy) - mapTerrain(pos-eps.xyy),
                 0.5*2.0*eps.x,
                 mapTerrain(pos+eps.yyx) - mapTerrain(pos-eps.yyx) ) );
      
      }
      
      vec4 mapTrees( in vec3 pos, in vec3 rd )
      {
          vec3  col = vec3(0.0);	
        float den = 1.0;
      
        float kklake = textureLod( iChannel0, 0.001*pos.zx, 0.0).x;
        float isLake = smoothstep( 0.7, 0.71, kklake );
        
        if( pos.y>1.0 || pos.y<0.0 ) 
        {
          den = 0.0;
        }
        else
        {
          
          float h = pos.y;
          float e = envelope( pos );
          float r = clamp(h/e,0.0,1.0);
          
              den = smoothstep( r, 1.0, textureLod(iChannel0, pos.xz*0.15, 0.0).x );
              
          den *= 1.0-0.95*clamp( (r-0.75)/(1.0-0.75) ,0.0,1.0);
          
              float id = textureLod( iChannel0, pos.xz, 0.0).x;
              float oc = pow( r, 2.0 );
      
          vec3  nor = calcNormal( pos );
          vec3  dif = vec3(1.0)*clamp( dot( nor, lig ), 0.0, 1.0 );
          float amb = 0.5 + 0.5*nor.y;
          
          float w = (2.8-pos.y)/lig.y;
          float c = fbm( (pos+w*lig)*0.35 );
          c = smoothstep( 0.38, 0.6, c );
          dif *= pow( vec3(c), vec3(0.8, 1.0, 1.5 ) );
            
          vec3  brdf = 1.7*vec3(1.5,1.0,0.8)*dif*(0.1+0.9*oc) + 1.3*amb*vec3(0.1,0.15,0.2)*oc;
      
          vec3 mate = 0.6*vec3(0.5,0.5,0.1);
          mate += 0.3*textureLod( iChannel1, 0.1*pos.xz, 0.0 ).zyx;
          
          col = brdf * mate;
      
          den *= 1.0-isLake;
        }
      
        return vec4( col, den );
      }
      
      
      vec4 raymarchTrees( in vec3 ro, in vec3 rd, float tmax, vec3 bgcol, out float resT )
      {
        vec4 sum = vec4(0.0);
          float t = tmax;
        for( int i=0; i<512; i++ )
        {
          vec3 pos = ro + t*rd;
          if( sum.a>0.99 || pos.y<0.0  || t>20.0 ) break;
          
          vec4 col = mapTrees( pos, rd );
      
          col.xyz = mix( col.xyz, bgcol, 1.0-exp(-0.0018*t*t) );
              
          col.rgb *= col.a;
      
          sum = sum + col*(1.0 - sum.a);	
          
          t += 0.0035*t;
        }
          
          resT = t;
      
        return clamp( sum, 0.0, 1.0 );
      }
      
      vec4 mapClouds( in vec3 p )
      {
        float d = 1.0-0.3*abs(2.8 - p.y);
        d -= 1.6 * fbm( p*0.35 );
      
        d = clamp( d, 0.0, 1.0 );
        
        vec4 res = vec4( d );
      
        res.xyz = mix( 0.8*vec3(1.0,0.95,0.8), 0.2*vec3(0.6,0.6,0.6), res.x );
        res.xyz *= 0.65;
        
        return res;
      }
      
      
      vec4 raymarchClouds( in vec3 ro, in vec3 rd, in vec3 bcol, float tmax, out float rays, ivec2 px )
      {
        vec4 sum = vec4(0, 0, 0, 0);
        rays = 0.0;
          
        float sun = clamp( dot(rd,lig), 0.0, 1.0 );
        float t = 0.1*texelFetch( iChannel0, px&ivec2(255), 0 ).x;
        for(int i=0; i<64; i++)
        {
          if( sum.w>0.99 || t>tmax ) break;
          vec3 pos = ro + t*rd;
          vec4 col = mapClouds( pos );
      
          float dt = max(0.1,0.05*t);
          float h = (2.8-pos.y)/lig.y;
          float c = fbm( (pos + lig*h)*0.35 );
          //kk += 0.05*dt*(smoothstep( 0.38, 0.6, c ))*(1.0-col.a);
          rays += 0.02*(smoothstep( 0.38, 0.6, c ))*(1.0-col.a)*(1.0-smoothstep(2.75,2.8,pos.y));
        
          
          col.xyz *= vec3(0.4,0.52,0.6);
          
              col.xyz += vec3(1.0,0.7,0.4)*0.4*pow( sun, 6.0 )*(1.0-col.w);
          
          col.xyz = mix( col.xyz, bcol, 1.0-exp(-0.0018*t*t) );
          
          col.a *= 0.5;
          col.rgb *= col.a;
      
          sum = sum + col*(1.0 - sum.a);	
      
          t += dt;//max(0.1,0.05*t);
        }
          rays = clamp( rays, 0.0, 1.0 );
      
        return clamp( sum, 0.0, 1.0 );
      }
      
      vec3 path( float time )
      {
        return vec3( 32.0*cos(0.2+0.75*.1*time*1.5), 1.2, 32.0*sin(0.1+0.75*0.11*time*1.5) );
      }
      
      mat3 setCamera( in vec3 ro, in vec3 ta, float cr )
      {
        vec3 cw = normalize(ta-ro);
        vec3 cp = vec3(sin(cr), cos(cr),0.0);
        vec3 cu = normalize( cross(cw,cp) );
        vec3 cv = normalize( cross(cu,cw) );
          return mat3( cu, cv, cw );
      }
      
      void moveCamera( float time, out vec3 oRo, out vec3 oTa, out float oCr, out float oFl )
      {
          // camera	
        oRo = path( time );
        oTa = path( time+1.0 );
        oTa.y *= 0.2;
        oCr = 0.3*cos(0.07*time);
          oFl = 1.75;
      }
      
      void mainImage( out vec4 fragColor, in vec2 fragCoord )
      {
          vec2 q = fragCoord.xy / iResolution.xy;
        vec2 p = -1.0 + 2.0*q;
        p.x *= iResolution.x / iResolution.y;
        
        float time = 23.5+iTime;
        
          // camera	
        vec3 ro, ta;
          float roll, fl;
          moveCamera( time, ro, ta, roll, fl );
              
        // camera tx
          mat3 cam = setCamera( ro, ta, roll );
      
          // ray direction
          vec3 rd = normalize( cam * vec3(p.xy,fl) );
      
          // sky	 
        vec3 col = vec3(0.84,0.95,1.0)*0.77 - rd.y*0.6;
        col *= 0.75;
        float sun = clamp( dot(rd,lig), 0.0, 1.0 );
          col += vec3(1.0,0.7,0.3)*0.3*pow( sun, 6.0 );
        vec3 bcol = col;
      
          // lakes
          float gt = (0.0-ro.y)/rd.y;
          if( gt>0.0 )
          {
              vec3 pos = ro + rd*gt;
      
          vec3 nor = vec3(0.0,1.0,0.0);
            nor.xz  = 0.10*(-1.0 + 2.0*texture( iChannel3, 1.5*pos.xz ).xz);
            nor.xz += 0.15*(-1.0 + 2.0*texture( iChannel3, 3.2*pos.xz ).xz);
            nor.xz += 0.20*(-1.0 + 2.0*texture( iChannel3, 6.0*pos.xz ).xz);
        nor = normalize(nor);
      
          vec3 ref = reflect( rd, nor );
            vec3 sref = reflect( rd, vec3(0.0,1.0,0.0) );
          float sunr = clamp( dot(ref,lig), 0.0, 1.0 );
      
            float kklake = texture( iChannel0, 0.001*pos.zx).x;
          col = vec3(0.1,0.1,0.0);
              vec3 lcol = vec3(0.2,0.5,0.7);
          col = mix( lcol, 1.1*vec3(0.2,0.6,0.7), 1.0-smoothstep(0.7,0.81,kklake) );
          
          col *= 0.12;
      
            float fre = 1.0 - max(sref.y,0.0);
          col += 0.8*vec3(1.0,0.9,0.8)*pow( sunr, 64.0 )*pow(fre,1.0);
          col += 0.5*vec3(1.0,0.9,0.8)*pow( fre, 10.0 );
      
          float h = (2.8-pos.y)/lig.y;
              float c = fbm( (pos+h*lig)*0.35 );
          col *= 0.4 + 0.6*smoothstep( 0.38, 0.6, c );
      
            col *= smoothstep(0.7,0.701,kklake);
      
            col.xyz = mix( col.xyz, bcol, 1.0-exp(-0.0018*gt*gt) );
          }
      
      
          // terrain	
        float t = raymarchTerrain(ro, rd);
          if( t>0.0 )
        {
              // trees		
              float ot;
              vec4 res = raymarchTrees( ro, rd, t, bcol, ot );
              t = ot;
            col = col*(1.0-res.w) + res.xyz;
        }
      
        // sun glow
          col += vec3(1.0,0.5,0.2)*0.35*pow( sun, 3.0 );
      
          float rays = 0.0;
          // clouds	
          {
        if( t<0.0 ) t=600.0;
          vec4 res = raymarchClouds( ro, rd, bcol, t, rays, ivec2(fragCoord) );
        col = col*(1.0-res.w) + res.xyz;
        }
      
        col += (1.0-0.8*col)*rays*rays*rays*0.4*vec3(1.0,0.8,0.7);
        col = clamp( col, 0.0, 1.0 );
      
        
          // gamma	
        col = pow( col, vec3(0.45) );
      
          // contrast, desat, tint and vignetting	
        col = col*0.1 + 0.9*col*col*(3.0-2.0*col);
        col = mix( col, vec3(col.x+col.y+col.z)*0.33, 0.2 );
        col *= vec3(1.06,1.05,1.0);
      
          //-------------------------------------
        // velocity vectors (through depth reprojection)
          //-------------------------------------
          float vel = 0.0;
          if( t<0.0 )
          {
              vel = -1.0;
          }
          else
          {
      
              // old camera position
              float oldTime = time - 1.0/30.0; // 1/30 of a second blur
              vec3 oldRo, oldTa; float oldCr, oldFl;
              moveCamera( oldTime, oldRo, oldTa, oldCr, oldFl );
              mat3 oldCam = setCamera( oldRo, oldTa, oldCr );
      
              // world space
              vec3 wpos = ro + rd*t;
              // camera space
              vec3 cpos = vec3( dot( wpos - oldRo, oldCam[0] ),
                                dot( wpos - oldRo, oldCam[1] ),
                                dot( wpos - oldRo, oldCam[2] ) );
              // ndc space
              vec2 npos = oldFl * cpos.xy / cpos.z;
              // screen space
              vec2 spos = 0.5 + 0.5*npos*vec2(iResolution.y/iResolution.x,1.0);
      
      
              // compress velocity vector in a single float
              vec2 uv = fragCoord/iResolution.xy;
              spos = clamp( 0.5 + 0.5*(spos - uv)/0.25, 0.0, 1.0 );
              vel = floor(spos.x*255.0) + floor(spos.y*255.0)*256.0;
          }
          
          fragColor = vec4( col, vel );
      }
      `
  }
]
