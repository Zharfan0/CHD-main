import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const data = await request.json()

    const prediction = await prisma.prediction.create({
      data: {
        name: data.nama || 'Anonymous',
        modelUsed: data.selectedModel || 'unknown',
        result: data.hasilPrediksi || 'unknown',
        confidence: data.confidence ?? null,
        physicalactivities: data.physicalactivities || null,
        hadasthma: data.hadasthma || null,
        removedteeth: data.removedteeth || null,
        alcoholdrinkers: data.alcoholdrinkers || null,
        fluvaxlast12: data.fluvaxlast12 || null,
        chestscan: data.chestscan || null,
        sex: data.sex || null,
        generalhealth: data.generalhealth || null,
        raceethnicitycategory: data.raceethnicitycategory || null,
        lastcheckuptime: data.lastcheckuptime || null,
        physicalhealthdays: data.physicalhealthdays || null,
        mentalhealthdays: data.mentalhealthdays || null,
        sleephours: data.sleephours || null,
        haddiabetes: data.haddiabetes || null,
        agecategory: data.agecategory || null,
        bmi: data.bmi || null,
        heightinmeters: data.heightinmeters || null,
        hadstroke: data.hadstroke || null,
        hadcopd: data.hadcopd || null,
        hadarthritis: data.hadarthritis || null,
        hadkidneydisease: data.hadkidneydisease || null,
        hadskincancer: data.hadskincancer || null,
        haddepressivedisorder: data.haddepressivedisorder || null,
        deaforhardofhearing: data.deaforhardofhearing || null,
        blindorvisiondifficulty: data.blindorvisiondifficulty || null,
        difficultyconcentrating: data.difficultyconcentrating || null,
        difficultywalking: data.difficultywalking || null,
        difficultydressingbathing: data.difficultydressingbathing || null,
        difficultyerrands: data.difficultyerrands || null,
        smokerstatus: data.smokerstatus || null,
        ecigaretteusage: data.ecigaretteusage || null,
        hivtesting: data.hivtesting || null,
        pneumovaxever: data.pneumovaxever || null,
        tetanuslast10tdap: data.tetanuslast10tdap || null,
        highrisklastyear: data.highrisklastyear || null,
        covidpos: data.covidpos || null,
      },
    })

    console.log('✅ Data tersimpan:', prediction.id)
    return NextResponse.json({ success: true, data: prediction })
    
  } catch (error) {
    console.error('❌ Error:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}