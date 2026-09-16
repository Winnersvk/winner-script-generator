'use client';
import {useState} from 'react';
import ProfilePicker from '../ProfilePicker';
export default function Brands({userId}){const [,setProfile]=useState(null);return <ProfilePicker userId={userId} onChange={setProfile}/>;}
