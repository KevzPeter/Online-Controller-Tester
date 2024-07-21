/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.16 dualsense.gltf --transform 
Files: dualsense.gltf [7.87KB] > C:\Everything\Projects\online-controller-tester\public\dualsense-transformed.glb [817.91KB] (-10293%)
Author: Chizuko V (https://sketchfab.com/chizuk0)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/dualsense-98bcc300aba0450a83f7a044f616b544
Title: Dualsense
*/

import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { degreesToRadians } from '@/lib/inputMapper';

export default function Model(props) {
  const { nodes, materials } = useGLTF('/dualsense-transformed.glb')
  return (
    <group {...props} dispose={null}>
       <group rotation={[degreesToRadians(-90), degreesToRadians(0), degreesToRadians(0)]} scale={props.scaleFactor * 5}>
        <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh geometry={nodes.Cube007_button_trans_0.geometry} material={materials.button_trans} />
      <mesh geometry={nodes.Cube011_dualsense_0.geometry} material={materials.dualsense} />
      </group>
      </group>
    </group>
  )
}

useGLTF.preload('/dualsense-transformed.glb')