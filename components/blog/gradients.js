// Collection of beautiful gradient backgrounds
export const gradients = [
  // Sunset vibes
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  
  // Ocean & Nature
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)',
  'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
  
  // Fire & Energy
  'linear-gradient(135deg, #f83600 0%, #f9d423 100%)',
  'linear-gradient(135deg, #ff512f 0%, #dd2476 100%)',
  'linear-gradient(135deg, #ff6a00 0%, #ee0979 100%)',
  'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)',
  
  // Purple & Pink
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
  'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)',
  'linear-gradient(135deg, #667eea 0%, #f093fb 100%)',
  
  // Blue & Cyan
  'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
  'linear-gradient(135deg, #37ecba 0%, #72afd3 100%)',
  'linear-gradient(135deg, #7f7fd5 0%, #86a8e7 50%, #91eae4 100%)',
  'linear-gradient(135deg, #3a7bd5 0%, #3a6073 100%)',
  
  // Warm & Cozy
  'linear-gradient(135deg, #fdbb2d 0%, #22c1c3 100%)',
  'linear-gradient(135deg, #fdbb2d 0%, #3a1c71 100%)',
  'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
  'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)',
  
  // Cool & Modern
  'linear-gradient(135deg, #00d2ff 0%, #928dab 100%)',
  'linear-gradient(135deg, #08aeea 0%, #2af598 100%)',
  'linear-gradient(135deg, #06beb6 0%, #48b1bf 100%)',
  'linear-gradient(135deg, #16a085 0%, #f4d03f 100%)',
  
  // Mystical & Dark
  'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  'linear-gradient(135deg, #373b44 0%, #4286f4 100%)',
  'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
  'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
  
  // Vibrant & Bold
  'linear-gradient(135deg, #eecda3 0%, #ef629f 100%)',
  'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)',
  'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
];

/**
 * Get a consistent gradient for a given string (like slug)
 * This ensures the same post always gets the same gradient
 */
export function getGradientForSlug(slug) {
  // Create a simple hash from the slug
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = slug.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Use absolute value and modulo to get a valid index
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}

/**
 * Get a truly random gradient (for variety)
 */
export function getRandomGradient() {
  return gradients[Math.floor(Math.random() * gradients.length)];
}
