import { useState, useEffect } from 'react'
import { ClipboardList, Search, Download, Filter } from 'lucide-react'
import api from '../services/api'
import DataTable from '../components/DataTable'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function AccessLogs() {
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    type: '',
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData(page = 1) {
    setLoading(true)
    try {
      const params = { page }
      if (filters.type) params.type = filters.type
      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate

      const response = await api.get('/access/logs', { params })
      setData(response.data.data)
      setPagination(response.data.pagination)
    } catch (error) {
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  async function handleExport() {
    toast.success('Função de exportação será implementada')
  }

  const typeColors = {
    GRANTED: 'bg-green-100 text-green-700',
    DENIED: 'bg-red-100 text-red-700',
    EXIT: 'bg-blue-100 text-blue-700',
    TIMEOUT: 'bg-yellow-100 text-yellow-700'
  }

  const typeLabels = {
    GRANTED: 'Liberado',
    DENIED: 'Negado',
    EXIT: 'Saída',
    TIMEOUT: 'Timeout'
  }

  const methodLabels = {
    CARD: 'Cartão',
    BIOMETRIC: 'Biometria',
    FACIAL: 'Facial',
    QR_CODE: 'QR Code',
    PIN: 'Senha',
    APP: 'App',
    MANUAL: 'Manual',
    REMOTE: 'Remoto'
  }

  const columns = [
    { 
      header: 'Data/Hora', 
      render: row => (
        <div>
          <p className="font-medium text-gray-800">
            {format(new Date(row.createdAt), 'dd/MM/yyyy')}
          </p>
          <p className="text-sm text-gray-500">
            {format(new Date(row.createdAt), 'HH:mm:ss')}
          </p>
        </div>
      )
    },
    { 
      header: 'Pessoa', 
      render: row => (
        <div>
          <p className="font-medium text-gray-800">
            {row.resident?.name || row.visitor?.name || 'Não identificado'}
          </p>
          <p className="text-sm text-gray-500">
            {row.resident?.unit ? `Unidade ${row.resident.unit}` : 'Visitante'}
          </p>
        </div>
      )
    },
    { 
      header: 'Dispositivo', 
      render: row => row.device?.name || '-'
    },
    { 
      header: 'Método', 
      render: row => (
        <span className="text-sm text-gray-600">
          {methodLabels[row.method] || row.method}
        </span>
      )
    },
    { 
      header: 'Tipo', 
      render: row => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${typeColors[row.type]}`}>
          {typeLabels[row.type]}
        </span>
      )
    },
    { 
      header: 'Condomínio', 
      render: row => row.condominium?.name || '-'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Histórico de Acessos</h1>
          <p className="text-gray-500">Visualize todos os registros de acesso</p>
        </div>
        <button onClick={handleExport} className="btn btn-secondary flex items-center gap-2">
          <Download className="w-5 h-5" />
          Exportar
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={filters.type}
              onChange={e => setFilters({ ...filters, type: e.target.value })}
              className="input w-40"
            >
              <option value="">Todos</option>
              <option value="GRANTED">Liberado</option>
              <option value="DENIED">Negado</option>
              <option value="EXIT">Saída</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={e => setFilters({ ...filters, startDate: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={e => setFilters({ ...filters, endDate: e.target.value })}
              className="input"
            />
          </div>

          <button onClick={() => loadData()} className="btn btn-primary flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtrar
          </button>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        pagination={pagination}
        onPageChange={loadData}
      />
    </div>
  )
}
