import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Listar jejuns do usuário (GET)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 });

  try {
    const jejuns = await prisma.fasting.findMany({
      where: { userId: userId },
      orderBy: { startTime: 'desc' },
    });
    return NextResponse.json(jejuns);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar jejuns' }, { status: 500 });
  }
}

// Iniciar um jejum (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const novoJejum = await prisma.fasting.create({
      data: {
        userId: body.userId,
        startTime: new Date(body.startTime),
        plannedType: body.plannedType,
        plannedHours: body.plannedHours,
        status: body.status,
      },
    });
    return NextResponse.json(novoJejum, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao iniciar jejum' }, { status: 500 });
  }
}