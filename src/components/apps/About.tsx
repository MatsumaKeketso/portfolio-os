import * as Icons from 'lucide-react';

export function About() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 p-8 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <Icons.Code2 className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">PortfolioOS</h1>
          <p className="text-slate-300 text-lg">Interactive Portfolio Showcase</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
            <Icons.User className="w-6 h-6" />
            About the Developer
          </h2>
          <p className="text-slate-200 leading-relaxed mb-4">
            Software Developer based in Johannesburg, South Africa. Passionate about creating innovative web applications
            and interactive experiences that push the boundaries of what's possible in the browser.
          </p>
          <p className="text-slate-200 leading-relaxed">
            Specializing in React, TypeScript, and modern web technologies, with a focus on building intuitive user
            interfaces and seamless user experiences.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
            <Icons.Briefcase className="w-6 h-6" />
            Featured Projects
          </h2>
          <div className="space-y-3">
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-1">NailHub Social</h3>
              <p className="text-slate-300 text-sm">Social platform connecting nail artists and enthusiasts</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-1">Delegation Coach</h3>
              <p className="text-slate-300 text-sm">AI-powered tool for effective task delegation</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-1">3D ShapeShift</h3>
              <p className="text-slate-300 text-sm">Interactive 3D modeling and visualization</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
            <Icons.Link className="w-6 h-6" />
            Connect
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-all"
            >
              <Icons.Github className="w-6 h-6 text-white" />
              <span className="text-white font-medium">GitHub</span>
            </a>
            <a
              href="https://base44.co.za"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-all"
            >
              <Icons.Rocket className="w-6 h-6 text-white" />
              <span className="text-white font-medium">Base44</span>
            </a>
            <a
              href="https://www.udemy.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-all"
            >
              <Icons.GraduationCap className="w-6 h-6 text-white" />
              <span className="text-white font-medium">Udemy</span>
            </a>
            <a
              href="https://www.nailhub.co.za"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-all"
            >
              <Icons.Heart className="w-6 h-6 text-white" />
              <span className="text-white font-medium">NailHub</span>
            </a>
          </div>
        </div>

        <div className="text-center mt-8 text-slate-400 text-sm">
          <p>Version 1.0.0 • Built with React, TypeScript, and Tailwind CSS</p>
        </div>
      </div>
    </div>
  );
}
