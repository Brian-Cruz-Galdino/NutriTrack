import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Cria o usuário no banco de dados local com o UID do Firebase
    const newUser = await prisma.user.create({
      data: {
        id: body.id,
        email: body.email,
        name: body.name,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao criar usuário no banco local' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar usuário' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const usuarioAtualizado = await prisma.user.update({
      where: { id: body.id },
      data: { calorieGoal: body.calorieGoal },
    });
    return NextResponse.json(usuarioAtualizado);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar meta calórica' }, { status: 500 });
  }
}