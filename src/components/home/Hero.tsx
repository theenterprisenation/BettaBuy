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
      <div 
        className="relative bg-gradient-to-b from-emerald-50/90 to-white min-h-[80vh] flex items-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1543362906-acfc16c67564?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.0.3')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/95 to-white/95" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Buy Together</span>
              <span className="block text-emerald-600">Save Together</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-600 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Join the smart food shopping revolution. Connect with others, buy in bulk, and save money while enjoying quality food.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                {user ? (
                  <Button size="lg" onClick={() => navigate('/products')}>
                    Browse Products
                  </Button>
                ) : (
                  <Button size="lg" onClick={() => navigate('/auth')}>
                    Start Saving Today
                  </Button>
                )}
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-3">
                <Button variant="outline" size="lg" onClick={() => setShowModal(true)}>
                  How It Works
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowModal(false)}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={() => setShowModal(false)}
                >
                  <span className="sr-only">Close</span>
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-2xl leading-6 font-bold text-gray-900 mb-8" id="modal-title">
                    How Group Buying Works
                  </h3>
                  <div className="space-y-8">
                    {steps.map((step, index) => (
                      <div key={index} className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-12 w-12 rounded-md bg-emerald-100 text-emerald-600">
                            <step.icon className="h-6 w-6" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-medium text-gray-900">{step.title}</h4>
                          <p className="mt-1 text-gray-500">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 sm:mt-10">
                <Button
                  className="w-full justify-center"
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