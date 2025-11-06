import Link from 'next/link';
import Image from 'next/image';

// --- Developer Data ---
const teamMembers = [
  {
    name: 'Sakshi Patel',
    role: 'Co-Developer',
    imageUrl: '/sakshi-placeholder.jpg', // Replace with actual image path in /public
    linkedinUrl: 'https://www.linkedin.com/in/sakshi-patel-403830291/',
  },
  {
    name: 'Devang Shaurya Pratap Singh',
    role: 'Co-Developer',
    imageUrl: '/devang-placeholder.jpg', // Replace with actual image path in /public
    linkedinUrl: 'https://www.linkedin.com/in/devangspsingh/',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold  sm:text-5xl md:text-6xl">
            About <span className="text-indigo-600">Gyan Aangan</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl ">
            Fostering a community of learners and innovators, one lesson at a time.
          </p>
        </div>

        {/* Using Tailwind Typography for beautiful article styling */}
        <article className="prose prose-invert lg:prose-xl mx-auto  p-8 rounded-lg shadow-lg">
          <h2>Our Mission 🎯</h2>
          <p>
            At Gyan Aangan, our mission is to make quality education accessible, engaging, and effective for everyone. We believe that learning is a lifelong journey, and we are dedicated to providing the resources and support needed to empower individuals to achieve their full potential.
          </p>
          <p>
            We started with a simple idea: to create a digital &lsquo;aangan&rsquo; (courtyard) where knowledge is shared freely, curiosity is encouraged, and collaboration flourishes. Whether you&apos;re a student, a professional looking to upskill, or simply a curious mind, you&apos;ll find a welcoming space here.
          </p>
          <blockquote>
            <p>&ldquo;An investment in knowledge pays the best interest.&rdquo; – Benjamin Franklin</p>
          </blockquote>
          {/* <h2>What We Offer 📚</h2>
          <ul>
            <li>
              <strong>Comprehensive Courses:</strong> Curated content across various domains to help you master new skills.
            </li>
            <li>
              <strong>Interactive Learning:</strong> Engaging materials, quizzes, and projects to ensure concepts stick.
            </li>
            <li>
              <strong>Community Support:</strong> A collaborative platform to connect with peers and mentors.
            </li>
          </ul> */}
        </article>

        <hr className="my-16 border-gray-200" />

        {/* --- The Team Section --- */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold ">Meet the Developers</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg ">
            The passionate minds behind the code, dedicated to building a seamless learning experience.
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:gap-12">
          {teamMembers.map((member) => (
            <div key={member.name} className="flex flex-col items-center text-center  p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
              {/* <Image
                className="w-32 h-32 rounded-full mx-auto"
                src={member.imageUrl}
                alt={`Photo of ${member.name}`}
                width={128}
                height={128}
                objectFit="cover"
              /> */}
              {/* <div className="w-32 h-32 rounded-full mx-auto flex items-center justify-center mb-4">
                 <span className="">Image</span>
              </div> */}
              <h3 className="mt-4 text-xl font-bold ">{member.name}</h3>
              <p className="text-indigo-600 font-semibold">{member.role}</p>
              <Link
                href={member.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded-lg text-sm px-5 py-2.5 transition-colors"
              >
                View LinkedIn
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}