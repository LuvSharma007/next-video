import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"
import { connectDB } from "./db";
import User from "@/models/user";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";


export const authOptions:NextAuthOptions = {
    providers:[
        CredentialsProvider({
            name:'Credentials',
            credentials:{
                Email:{label:"Email",type:"text"},
                Password:{label:"Password",type:"password"}
            },
            async authorize(credentials,req){
                if(!credentials?.Email || !credentials?.Password){
                    throw new Error("Missing email or password")
                }
                try {
                    await connectDB()
                    const email = credentials.Email;
                    const foundUser = await User.findOne({email})
                    if(!foundUser){
                        return null;
                    }
                    const isPasswordMatched = await bcrypt.compare(credentials.Password , foundUser.password)
                    if(!isPasswordMatched){
                        return null;                   
                    }

                    return{
                        id:foundUser._id.toString(),
                        email:foundUser.email
                    }

                } catch (error) {
                    return null;
                }
            }
        })
    ],
    callbacks:{
        async jwt({token,user}) {
            if(user){
                token.id = user.id
            }
            return token
        },

        async session({session,token,user}) {
            if(user){
                session.user.id = token.id as string
            }
            return session;
        }
    },
    pages:{
        signIn:"/login",
        error:"/login"
    },
    session:{
        strategy:"jwt",
        maxAge:30*24*60*60,
    },
    secret:process.env.NEXT_AUTH_SECRET,
    
    
};