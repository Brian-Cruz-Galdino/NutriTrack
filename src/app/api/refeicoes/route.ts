import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Lista as refeições de um usuário (GET)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 });
  }

  try {
    const refeicoes = await prisma.meal.findMany({
      where: { userId: userId },
      orderBy: { dateTime: 'desc' },
    });
    return NextResponse.json(refeicoes);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar refeições' }, { status: 500 });
  }
}

// Cria uma nova refeição (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const novaRefeicao = await prisma.meal.create({
      data: {
        userId: body.userId,
        dateTime: new Date(body.dateTime),
        description: body.description,
        calories: Number(body.calories), // <-- A proteção está aqui
        mealType: body.mealType,
      },
    });

    return NextResponse.json(novaRefeicao, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao criar refeição' }, { status: 500 });
  }
}