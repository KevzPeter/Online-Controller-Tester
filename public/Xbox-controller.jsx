/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.16 xbox-controller.gltf --transform 
Files: xbox-controller.gltf [4.7KB] > C:\Everything\Projects\ps5-controller-3d\public\xbox-controller-transformed.glb [157.62KB] (-3254%)
Author: DogexorRexUwU (https://sketchfab.com/oscar.lopez.riviello)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/xbox-inalambric-controller-white-f18a70fc10414ef5a39b55de68f12823
Title: Xbox Inalambric Controller (White)
*/
"use client";

import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { degreesToRadians } from '@/lib/inputMapper';

export default function Model(props) {
  const { nodes, materials } = useGLTF('/xbox-controller-transformed.glb')
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Object_5.geometry} material={materials.material} rotation={[degreesToRadians(90), degreesToRadians(270), degreesToRadians(45)]} scale={props.scaleFactor} />
    </group>
  )
}

useGLTF.preload('/xbox-controller-transformed.glb')
