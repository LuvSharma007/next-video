import { NextRequest , NextResponse } from "next/server";
import User from "@/models/user";
import { connectDB } from "@/lib/db";

export async function POST(request:NextRequest){
    
    try {
        const {email,password} = await request.json()
        
        if(!email || !password){
            return NextResponse.json({
                message:"All fields are required"
            },{status:400})
        }
        await connectDB();
    
        const existingUser = await User.findOne({email})
        if(existingUser){
            return NextResponse.json({
                message:"User with these credientials already exists"
            },{status:500})
        }
    
        await User.create({
            email,
            password
        })
    
        return NextResponse.json({
            message:"User registered successfully",
        },{status:200})
    } catch (error) {
        console.log('Error registering user');        
        return NextResponse.json({
            message:"Error registering user"
        },{status:400})
    }
}