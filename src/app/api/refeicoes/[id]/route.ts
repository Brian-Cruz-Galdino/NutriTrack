import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Editar uma refeição (PUT)
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    
    const refeicaoAtualizada = await prisma.meal.update({
      where: { id: resolvedParams.id },
      data: {
        dateTime: new Date(body.dateTime),
        description: body.description,
        calories: Number(body.calories), 
        mealType: body.mealType,
      },
    });
    return NextResponse.json(refeicaoAtualizada);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao editar refeição' }, { status: 500 });
  }
}

// Excluir uma refeição (DELETE)
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    
    await prisma.meal.delete({
      where: { id: resolvedParams.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir refeição' }, { status: 500 });
  }
}