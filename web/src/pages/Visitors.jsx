import { useState, useEffect } from 'react'
import { Plus, UserCheck, Search, LogIn, LogOut, Trash2 } from 'lucide-react'
import api from '../services/api'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function Visitors() {
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [condominiums, setCondominiums] = useState([])
  const [residents, setResidents] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    document: '',
    phone: '',
    vehicle: '',
    vehiclePlate: '',
    reason: '',
    visitingResidentId: '',
    condominiumId: ''
  })

  useEffect(() => {
    loadData()
    loadCondominiums()
  }, [])

  async function loadCondominiums() {
    try {
      const response = await api.get('/condominiums', { params: { limit: 100 } })
      setCondominiums(response.data.data)
    } catch (error) {
      console.error(error)
    }
  }

  async function loadResidents(condominiumId) {
    if (!condominiumId) {
      setResidents([])
      return
    }
    try {
      const response = await api.get('/residents', { 
        params: { condominiumId, limit: 100 } 
      })
      setResidents(response.data.data)
    } catch (error) {
      console.error(error)
    }
  }

  async function loadData(page = 1) {
    setLoading(true)
    try {
      const response = await api.get('/visitors', {
        params: { page, search }
      })
      setData(response.data.data)
      setPagination(response.data.pagination)
    } catch (error) {
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  function openModal() {
    setForm({
      name: '',
      document: '',
      phone: '',
      vehicle: '',
      vehiclePlate: '',
      reason: '',
      visitingResidentId: '',
      condominiumId: condominiums[0]?.id || ''
    })
    if (condominiums[0]?.id) {
      loadResidents(condominiums[0].id)
    }
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await api.post('/visitors', form)
      toast.success('Visitante cadastrado!')
      setModalOpen(false)
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao salvar')
    }
  }

  async function handleCheckIn(visitor) {
    try {
      await api.post(`/visitors/${visitor.id}/checkin`)
      toast.success('Check-in realizado!')
      loadData()
    } catch (error) {
      toast.error('Erro no check-in')
    }
  }

  async function handleCheckOut(visitor) {
    try {
      await api.post(`/visitors/${visitor.id}/checkout`)
      toast.success('Check-out realizado!')
      loadData()
    } catch (error) {
      toast.error('Erro no check-out')
    }
  }

  async function handleDelete(item) {
    if (!confirm(`Remover visitante "${item.name}"?`)) return
    
    try {
      await api.delete(`/visitors/${item.id}`)
      toast.success('Removido!')
      loadData()
    } catch (error) {
      toast.error('Erro ao remover')
    }
  }

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-blue-100 text-blue-700',
    INSIDE: 'bg-green-100 text-green-700',
    LEFT: 'bg-gray-100 text-gray-700',
    DENIED: 'bg-red-100 text-red-700'
  }

  const statusLabels = {
    PENDING: 'Aguardando',
    APPROVED: 'Aprovado',
    INSIDE: 'No local',
    LEFT: 'Saiu',
    DENIED: 'Negado'
  }

  const columns = [
    { 
      header: 'Visitante', 
      render: row => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="font-medium text-gray-800">{row.name}</p>
            <p className="text-sm text-gray-500">{row.document}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Visitando', 
      render: row => row.visitingResident ? (
        <div>
          <p className="text-gray-800">{row.visitingResident.name}</p>
          <p className="text-sm text-gray-500">Unidade {row.visitingResident.unit}</p>
        </div>
      ) : '-'
    },
    { 
      header: 'Motivo', 
      accessor: 'reason'
    },
    { 
      header: 'Veículo', 
      render: row => row.vehiclePlate || '-'
    },
    { 
      header: 'Status', 
      render: row => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[row.status]}`}>
          {statusLabels[row.status]}
        </span>
      )
    },
    { 
      header: 'Entrada', 
      render: row => row.checkInAt ? format(new Date(row.checkInAt), 'dd/MM HH:mm') : '-'
    },
    {
      header: 'Ações',
      render: row => (
        <div className="flex items-center gap-1">
          {row.status === 'PENDING' && (
            <button 
              onClick={() => handleCheckIn(row)}
              className="p-2 hover:bg-green-50 rounded-lg"
              title="Check-in"
            >
              <LogIn className="w-4 h-4 text-green-600" />
            </button>
          )}
          {row.status === 'INSIDE' && (
            <button 
              onClick={() => handleCheckOut(row)}
              className="p-2 hover:bg-orange-50 rounded-lg"
              title="Check-out"
            >
              <LogOut className="w-4 h-4 text-orange-600" />
            </button>
          )}
          <button 
            onClick={() => handleDelete(row)}
            className="p-2 hover:bg-red-50 rounded-lg"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Visitantes</h1>
          <p className="text-gray-500">Controle de entrada e saída de visitantes</p>
        </div>
        <button onClick={openModal} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Novo Visitante
        </button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou documento..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && loadData()}
            className="input pl-10"
          />
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

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Novo Visitante"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Documento *</label>
              <input
                type="text"
                value={form.document}
                onChange={e => setForm({ ...form, document: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input
                type="text"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condomínio *</label>
              <select
                value={form.condominiumId}
                onChange={e => {
                  setForm({ ...form, condominiumId: e.target.value, visitingResidentId: '' })
                  loadResidents(e.target.value)
                }}
                className="input"
                required
              >
                <option value="">Selecione...</option>
                {condominiums.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visitando</label>
              <select
                value={form.visitingResidentId}
                onChange={e => setForm({ ...form, visitingResidentId: e.target.value })}
                className="input"
              >
                <option value="">Selecione um morador...</option>
                {residents.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} - {r.unit}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Veículo</label>
              <input
                type="text"
                value={form.vehicle}
                onChange={e => setForm({ ...form, vehicle: e.target.value })}
                className="input"
                placeholder="Ex: Carro prata"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Placa</label>
              <input
                type="text"
                value={form.vehiclePlate}
                onChange={e => setForm({ ...form, vehiclePlate: e.target.value })}
                className="input"
                placeholder="ABC-1234"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Motivo da visita</label>
              <input
                type="text"
                value={form.reason}
                onChange={e => setForm({ ...form, reason: e.target.value })}
                className="input"
                placeholder="Ex: Entrega, Visita familiar, etc."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Cadastrar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
