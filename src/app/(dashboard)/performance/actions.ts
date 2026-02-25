'use server'

import { createClient } from '@/lib/supabase/server'

export async function getPerformanceData() {
  const supabase = await createClient()

  const [
    { data: tx },
    { data: accounts },
    { data: fixed },
    { data: goals },
    { data: credits }
  ] = await Promise.all([
    supabase.from('transactions').select('amount, type'),
    supabase.from('accounts').select('balance'),
    supabase.from('fixed_expenses').select('amount').eq('is_active', true),
    supabase.from('savings').select('current_amount, target_amount, name'),
    supabase.from('credits').select('remaining_amount, installment_value, name')
  ])

  // --- CÁLCULOS BASE ---
  const ingresos = tx?.filter(t => t.type === 'income').reduce((a, b) => a + Number(b.amount), 0) ?? 0
  const gastosEjecutados = tx?.filter(t => t.type === 'expense').reduce((a, b) => a + Number(b.amount), 0) ?? 0
  const totalFijos = fixed?.reduce((a, b) => a + Number(b.amount), 0) ?? 0
  const cuotaCreditos = credits?.reduce((a, b) => a + Number(b.installment_value), 0) ?? 0
  const deudaTotal = credits?.reduce((a, b) => a + Number(b.remaining_amount), 0) ?? 0
  const liquidez = accounts?.reduce((a, b) => a + Number(b.balance), 0) ?? 0

  // --- INTELIGENCIA DE PROYECCIÓN ---
  const compromisoMensual = totalFijos + cuotaCreditos
  const ahorroNetoMensual = ingresos - gastosEjecutados - compromisoMensual
  
  // 1. Análisis de Metas (Savings Goals)
  const metaObj = goals?.reduce((a, b) => a + Number(b.target_amount), 0) ?? 0
  const metaAct = goals?.reduce((a, b) => a + Number(b.current_amount), 0) ?? 0
  const faltanteMeta = metaObj - metaAct
  
  // 2. Runway (Días/Meses de supervivencia con ahorros actuales)
  const gastoMensualEstimado = gastosEjecutados + compromisoMensual
  const runwayMeses = gastoMensualEstimado > 0 ? (liquidez / gastoMensualEstimado).toFixed(1) : '∞'

  // --- GENERACIÓN DE INSIGHTS DINÁMICOS ---
  const insights = []

  // Insight de Ahorro
  if (faltanteMeta > 0) {
    const mesesParaMeta = ahorroNetoMensual > 0 ? Math.ceil(faltanteMeta / ahorroNetoMensual) : null
    insights.push({
      id: 'saving',
      icon: 'Target',
      title: "Ruta a la Meta",
      desc: mesesParaMeta 
        ? `A tu ritmo actual, completarás tus objetivos en ${mesesParaMeta} meses.` 
        : "Tu flujo actual no permite ahorrar para la meta. Revisa tus gastos fijos.",
      action: mesesParaMeta ? `Para llegar en 4 meses, ahorra ${new Intl.NumberFormat('es-CL').format(Math.ceil(faltanteMeta/4))} /mes.` : "Reduce gastos fijos un 15%."
    })
  }

  // Insight de Deuda
  const debtRatio = (cuotaCreditos / ingresos) * 100
  if (debtRatio > 0) {
    insights.push({
      id: 'debt',
      icon: 'Zap',
      title: "Carga de Deuda",
      desc: `Tus cuotas consumen el ${debtRatio.toFixed(1)}% de tus ingresos.`,
      action: debtRatio > 30 ? "Crítico: Evita nuevos créditos y liquida el de mayor interés." : "Nivel saludable. Mantén el pago puntual."
    })
  }

  // Insight de Supervivencia
  insights.push({
    id: 'runway',
    icon: 'ShieldCheck',
    title: "Resiliencia Financiera",
    desc: `Tienes liquidez para vivir ${runwayMeses} meses sin nuevos ingresos.`,
    action: Number(runwayMeses) < 6 ? "Objetivo: Aumentar fondo de emergencia a 6 meses." : "Excelente. Considera invertir el excedente."
  })

  return {
    metrics: {
      ingresos,
      gastos: gastosEjecutados,
      patrimonio: liquidez - deudaTotal,
      score: calcularSalud(ahorroNetoMensual, liquidez, deudaTotal)
    },
    pendientes: {
      gastosFijos: totalFijos,
      cuotasCreditos: cuotaCreditos,
      totalMes: compromisoMensual
    },
    deuda: { totalPorPagar: deudaTotal },
    meta: {
      actual: metaAct,
      objetivo: metaObj,
      porcentaje: metaObj > 0 ? (metaAct / metaObj) * 100 : 0
    },
    insights // Array de consejos pro
  }
}

function calcularSalud(neto: number, liq: number, deuda: number) {
  let s = 60
  if (neto > 0) s += 20
  if (liq > deuda) s += 20
  if (neto < 0) s -= 30
  return Math.max(0, Math.min(100, s))
}