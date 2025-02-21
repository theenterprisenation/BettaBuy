import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { X, ShoppingBag, Users, Truck, CreditCard, Clock } from 'lucide-react';

export function Hero() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const steps = [
    {
      icon: ShoppingBag,
      title: 'Browse Products',
      description: 'Explore our selection of bulk food items from verified vendors.'
    },
    {
      icon: Users,
      title: 'Join Group Buys',
      description: 'Team up with others to unlock bulk pricing and save money.'
    },
    {
      icon: Truck,
      title: 'Pick Delivery Option',
      description: 'Choose Pickup, Door-step Delivery or Stockpiling. Please note that stockpiling is only allowed for non-perishable products.'
    },
    {
      icon: CreditCard,
      title: 'Make Your Payment',
      description: 'Make payment 2 days before the product sharing day.'
    },
    {
      icon: Clock,
      title: 'Wait for Completion',
      description: 'Once enough people join, the group buy is confirmed, product is shared and delivered on the assigned product share day/date.'
    }
  ];

  return (
    <>
      <div className="relative min-h-screen overflow-hidden">
        {/* Background with gradient overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1576181256399-834e3b3a49bf?q=80&w=2070&auto=format&fit=crop')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/95 via-emerald-800/90 to-emerald-900/95" />
        </div>

        {/* Responsive Tomato Image */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1582284540020-8acbe03f4924?q=80&w=500&auto=format&fit=crop"
            alt="Fresh Tomatoes"
            className="absolute w-[80vw] h-[80vw] md:w-[30vw] md:h-[30vw] lg:w-[45rem] lg:h-[45rem] object-cover rounded-full -top-32 -right-32 xl:-right-16 shadow-2xl transform -rotate-12 animate-float-slow"
          />
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="text-left">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6">
                <span className="block">Buy Together</span>
                <span className="block text-emerald-400">Save Together</span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-emerald-50/90 leading-relaxed max-w-xl">
                Join the smart food shopping revolution. Connect with others, buy in bulk, 
                and save money while enjoying quality food.
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                {user ? (
                  <Button 
                    size="lg"
                    onClick={() => navigate('/products')}
                    className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 text-lg shadow-lg hover:shadow-emerald-500/25 transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Browse Products
                  </Button>
                ) : (
                  <Button 
                    size="lg"
                    onClick={() => navigate('/auth')}
                    className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 text-lg shadow-lg hover:shadow-emerald-500/25 transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Start Saving Today
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => setShowModal(true)}
                  className="border-2 border-emerald-400 text-emerald-400 hover:bg-emerald-400/10 px-8 py-4 text-lg transition-colors duration-200"
                >
                  How It Works
                </Button>
              </div>

              {/* Stats Section */}
              <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
                {[
                  { label: 'Active Users', value: '2,000+' },
                  { label: 'Vendors', value: '100+' },
                  { label: 'Cities', value: '25+' },
                  { label: 'Savings', value: 'Up to 30%' }
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <p className="text-3xl font-bold text-emerald-400">{stat.value}</p>
                    <p className="mt-1 text-sm text-emerald-100">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Empty Space */}
            <div className="relative hidden lg:block">
              {/* Space for floating image */}
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 backdrop-blur-sm">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="relative bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>

              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                How Group Buying Works
              </h2>

              <div className="space-y-8">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <step.icon className="h-6 w-6" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                      <p className="mt-1 text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Button
                  className="w-full justify-center text-lg py-3"
                  onClick={() => {
                    setShowModal(false);
                    if (!user) {
                      navigate('/auth');
                    } else {
                      navigate('/products');
                    }
                  }}
                >
                  {user ? 'Browse Products' : 'Get Started'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}