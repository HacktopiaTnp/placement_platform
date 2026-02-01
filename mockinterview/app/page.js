"use client"
import React from 'react'
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

import Head from 'next/head';
import Link from 'next/link';

const page = () => {
  const router = useRouter();
  router.push('/dashboard');
  return (


    <div>
      
    </div>
  )
}

export default page