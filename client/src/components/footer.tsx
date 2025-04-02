export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="md:flex md:justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-bold mb-2">Resource Finder</h2>
            <p className="text-gray-300 text-sm">Find community resources near you</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Contact</h3>
            <p className="text-gray-300 text-sm">
              Email: support@resourcefinder.org<br />
              Phone: (555) 123-4567
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-6 pt-6 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Resource Finder. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
