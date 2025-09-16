import React from 'react';
import Banner from '../components/Banner';
import Servicecards from '../components/Servicecards';

// Fix: Accept params and pass them down
export default function Services({ params }) {
  return (
    <div>
        <Banner />
        <Servicecards params={params} />
    </div>
  );
}