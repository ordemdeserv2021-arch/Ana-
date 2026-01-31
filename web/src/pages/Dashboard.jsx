import { useState, useEffect } from 'react'
import { Users, UserCheck, Cpu, ClipboardList, TrendingUp, Clock } from 'lucide-react'
import api from '../services/api'
import StatsCard from '../components/StatsCard'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    try {
      const response = await api.get('/access/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">Visão geral do sistema</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Acessos Hoje"
          value={stats?.today || 0}
          icon={ClipboardList}
          color="primary"
        />
        <StatsCard
          title="Acessos na Semana"
          value={stats?.week || 0}
          icon={TrendingUp}
          color="green"
        />
        <StatsCard
          title="Acessos no Mês"
          value={stats?.month || 0}
          icon={Clock}
          color="purple"
        />
        <StatsCard
          title="Visitantes Ativos"
          value={stats?.activeVisitors || 0}
          icon={UserCheck}
          color="yellow"
        />
      </div>

      {/* Recent Access */}
      <div className="card">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Últimos Acessos</h2>
        </div>
        <div className="divide-y">
          {stats?.recent?.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhum acesso registrado ainda
            </div>
          ) : (
            stats?.recent?.map((access, i) => (
              <div key={access.id || i} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  access.type === 'GRANTED' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {access.resident?.photo ? (
                    <img 
                      src={access.resident.photo} 
                      alt="" 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <Users className={`w-5 h-5 ${
                      access.type === 'GRANTED' ? 'text-green-600' : 'text-red-600'
                    }`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">
                    {access.resident?.name || 'Visitante'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {access.device?.name || 'Acesso manual'} 
                    {access.resident?.unit && ` • Unidade ${access.resident.unit}`}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    access.type === 'GRANTED' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {access.type === 'GRANTED' ? 'Liberado' : 'Negado'}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    {format(new Date(access.createdAt), "HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
