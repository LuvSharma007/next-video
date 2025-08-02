import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Video, { IVideo } from "@/models/video";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(){
    try {
        await connectDB()
        const videos = await Video.find({}).sort({createdAt:-1}).lean()
        if(!videos || videos.length <= 0){
            return NextResponse.json([],
            {status:200})
        } 

        return NextResponse.json(videos,{status:200})

    } catch (error) {
        return NextResponse.json({
        message:"Failed to fetch videos"
        },{status:200})
    }
}


export async function POST(request:Request){
    try {
        const session = await getServerSession(authOptions);
        if(!session){
            return NextResponse.json(
                {error:"Unauthorised access"},
                {status:401}
            )
        }
        await connectDB()
        const body:IVideo = await request.json()
        if(!body.title || !body.description || !body.videoUrl || !body.thumbnailUrl){
            return NextResponse.json(
                {error:"Missing required fields"},
                {status:400},
            )
        }

        const videoData = {
            ...body,
            controls: body?.controls ?? true,
            transformation:{
                height:1920,
                width:1080,
                quality : body?.transformation?.quality ?? 100,
            }
        }
        const newVideo = await Video.create(videoData)
        return NextResponse.json({
            message:"Video uploaded successfully",
            newVideo,
        },{status:200})
        
    } catch (error) {
        return NextResponse.json({
            message:"Error while uploading video",
        },{status:500})
        
    }
}