/* eslint-disable @next/next/no-img-element */
import React from "react";
import Link from 'next/link'

const Logo = () => {
  return (
    <Link href="/" className="text-2xl font-bold text-primary">
      <img src="/images/logo.png" alt="logo" className="h-9 w-auto"/>
    </Link>
  )
}

export default Logo
