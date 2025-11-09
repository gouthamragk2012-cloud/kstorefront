import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to KStore</h1>
          <p className="text-xl mb-8">Your modern ecommerce solution</p>
          <Link 
            href="/products" 
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-block"
          >
            Shop Now
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <h3 className="text-xl font-semibold mb-2">Wide Selection</h3>
            <p className="text-gray-600">Browse thousands of products</p>
          </div>
          <div className="text-center p-6">
            <h3 className="text-xl font-semibold mb-2">Secure Checkout</h3>
            <p className="text-gray-600">Safe and secure payment processing</p>
          </div>
          <div className="text-center p-6">
            <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
            <p className="text-gray-600">Quick shipping to your doorstep</p>
          </div>
        </div>
      </div>
    </main>
  );
}
