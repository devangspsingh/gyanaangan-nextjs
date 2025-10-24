import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get parameters from URL
    const title = searchParams.get('title') || 'Gyan Aangan';
    const description = searchParams.get('description') || 'Browse a variety of courses, subjects, and resources';
    const type = searchParams.get('type') || 'resource'; // resource, course, subject, blog
    
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#0f172a', // slate-900
            backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)',
            position: 'relative',
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* Top Bar - Logo & Site Title */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '50px 60px',
              position: 'relative',
              zIndex: 10,
            }}
          >
            {/* Logo and Brand */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '16px',
                  // background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '20px',
                  boxShadow: '0 10px 40px rgba(59, 130, 246, 0.4)',
                }}
              >
                <img
                  src="https://gyanaangan.in/images/logo white.png" 
                  width={70}
                  height={70}
                  style={{
                    borderRadius: '16px',
                  }}
                  alt="Logo"
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <span
                  style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: 'white',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Gyan Aangan
                </span>
                <span
                  style={{
                    fontSize: '16px',
                    color: '#94a3b8',
                    marginTop: '2px',
                  }}
                >
                  Knowledge Hub
                </span>
              </div>
            </div>

            {/* Type Badge */}
            {type && (
              <div
                style={{
                  display: 'flex',
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  padding: '10px 28px',
                  borderRadius: '999px',
                  border: '2px solid rgba(59, 130, 246, 0.4)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <span
                  style={{
                    fontSize: '18px',
                    color: '#60a5fa',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  {type}
                </span>
              </div>
            )}
          </div>

          {/* Main Content - Title as Hero */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              padding: '0 80px',
              position: 'relative',
              zIndex: 10,
            }}
          >
            {/* Title - Main Focus */}
            <h1
              style={{
                fontSize: title.length > 50 ? '56px' : title.length > 30 ? '68px' : '80px',
                fontWeight: 'bold',
                color: 'white',
                lineHeight: 1.1,
                textAlign: 'center',
                marginBottom: '30px',
                textShadow: '0 4px 24px rgba(0, 0, 0, 0.5)',
                maxWidth: '1000px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {title}
            </h1>

            {/* Description - Subtle */}
            {description && (
              <p
                style={{
                  fontSize: '26px',
                  color: '#94a3b8',
                  lineHeight: 1.5,
                  textAlign: 'center',
                  maxWidth: '900px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {description}
              </p>
            )}

            {/* Decorative Line */}
            <div
              style={{
                marginTop: '40px',
                width: '120px',
                height: '4px',
                background: 'linear-gradient(90deg, transparent 0%, #3b82f6 50%, transparent 100%)',
                borderRadius: '999px',
              }}
            />
          </div>

          {/* Bottom Bar - URL */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 60px 50px',
              position: 'relative',
              zIndex: 10,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                padding: '16px 32px',
                borderRadius: '999px',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  marginRight: '12px',
                }}
              />
              <span
                style={{
                  fontSize: '22px',
                  color: '#cbd5e1',
                  fontWeight: '500',
                  letterSpacing: '0.02em',
                }}
              >
                gyanaangan.in
              </span>
            </div>
          </div>

          {/* Decorative Glow Elements */}
          <div
            style={{
              position: 'absolute',
              top: '-150px',
              right: '-150px',
              width: '500px',
              height: '500px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-150px',
              left: '-150px',
              width: '500px',
              height: '500px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />

          {/* Subtle Corner Accents */}
          <div
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              width: '200px',
              height: '200px',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, transparent 100%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '0',
              right: '0',
              width: '200px',
              height: '200px',
              background: 'linear-gradient(-45deg, rgba(168, 85, 247, 0.08) 0%, transparent 100%)',
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
