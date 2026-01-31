import { useState, useEffect } from 'react'
import { Plus, Cpu, Edit, Trash2, RefreshCw, Power } from 'lucide-react'
import api from '../services/api'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function Devices() {
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [condominiums, setCondominiums] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [syncing, setSyncing] = useState(null)
  const [form, setForm] = useState({
    name: '',
    ip: '',
    port: 80,
    model: '',
    serialNumber: '',
    location: '',
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

  async function loadData(page = 1) {
    setLoading(true)
    try {
      const response = await api.get('/devices', { params: { page } })
      setData(response.data.data)
      setPagination(response.data.pagination)
    } catch (error) {
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  function openModal(item = null) {
    if (item) {
      setEditing(item)
      setForm({
        name: item.name,
        ip: item.ip,
        port: item.port,
        model: item.model,
        serialNumber: item.serialNumber || '',
        location: item.location || '',
        condominiumId: item.condominiumId
      })
    } else {
      setEditing(null)
      setForm({
        name: '',
        ip: '',
        port: 80,
        model: 'iDAccess',
        serialNumber: '',
        location: '',
        condominiumId: condominiums[0]?.id || ''
      })
    }
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      if (editing) {
        await api.put(`/devices/${editing.id}`, form)
        toast.success('Dispositivo atualizado!')
      } else {
        await api.post('/devices', form)
        toast.success('Dispositivo cadastrado!')
      }
      setModalOpen(false)
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao salvar')
    }
  }

  async function handleSync(device) {
    setSyncing(device.id)
    try {
      await api.post(`/devices/${device.id}/sync`)
      toast.success('Sincronização iniciada!')
      loadData()
    } catch (error) {
      toast.error('Erro ao sincronizar')
    } finally {
      setSyncing(null)
    }
  }

  async function handleDelete(item) {
    if (!confirm(`Remover dispositivo "${item.name}"?`)) return
    
    try {
      await api.delete(`/devices/${item.id}`)
      toast.success('Removido!')
      loadData()
    } catch (error) {
      toast.error('Erro ao remover')
    }
  }

  const statusColors = {
    ONLINE: 'bg-green-100 text-green-700',
    OFFLINE: 'bg-gray-100 text-gray-700',
    ERROR: 'bg-red-100 text-red-700',
    MAINTENANCE: 'bg-yellow-100 text-yellow-700'
  }

  const columns = [
    { 
      header: 'Dispositivo', 
      render: row => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            row.status === 'ONLINE' ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            <Cpu className={`w-5 h-5 ${
              row.status === 'ONLINE' ? 'text-green-600' : 'text-gray-600'
            }`} />
          </div>
          <div>
            <p className="font-medium text-gray-800">{row.name}</p>
            <p className="text-sm text-gray-500">{row.model}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'IP', 
      render: row => `${row.ip}:${row.port}`
    },
    { 
      header: 'Local', 
      render: row => row.location || '-'
    },
    { 
      header: 'Condomínio', 
      render: row => row.condominium?.name || '-'
    },
    { 
      header: 'Status', 
      render: row => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[row.status]}`}>
          {row.status}
        </span>
      )
    },
    { 
      header: 'Última Sync', 
      render: row => row.lastSync ? format(new Date(row.lastSync), 'dd/MM HH:mm') : 'Nunca'
    },
    {
      header: 'Ações',
      render: row => (
        <div className="flex items-center gap-1">
          <button 
            onClick={() => handleSync(row)}
            disabled={syncing === row.id}
            className="p-2 hover:bg-blue-50 rounded-lg disabled:opacity-50"
            title="Sincronizar"
          >
            <RefreshCw className={`w-4 h-4 text-blue-600 ${syncing === row.id ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => openModal(row)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Edit className="w-4 h-4 text-gray-600" />
          </button>
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
          <h1 className="text-2xl font-bold text-gray-800">Dispositivos</h1>
          <p className="text-gray-500">Gerencie controladoras Control ID</p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Novo Dispositivo
        </button>
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
        title={editing ? 'Editar Dispositivo' : 'Novo Dispositivo'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="input"
              placeholder="Ex: Portaria Principal"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IP *</label>
              <input
                type="text"
                value={form.ip}
                onChange={e => setForm({ ...form, ip: e.target.value })}
                className="input"
                placeholder="192.168.1.100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Porta</label>
              <input
                type="number"
                value={form.port}
                onChange={e => setForm({ ...form, port: parseInt(e.target.value) })}
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
              <select
                value={form.model}
                onChange={e => setForm({ ...form, model: e.target.value })}
                className="input"
              >
                <option value="iDAccess">iDAccess</option>
                <option value="iDAccess Pro">iDAccess Pro</option>
                <option value="iDBox">iDBox</option>
                <option value="iDFlex">iDFlex</option>
                <option value="iDFace">iDFace</option>
                <option value="iDUHF">iDUHF</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nº Série</label>
              <input
                type="text"
                value={form.serialNumber}
                onChange={e => setForm({ ...form, serialNumber: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
            <input
              type="text"
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
              className="input"
              placeholder="Ex: Entrada principal, Garagem"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Condomínio *</label>
            <select
              value={form.condominiumId}
              onChange={e => setForm({ ...form, condominiumId: e.target.value })}
              className="input"
              required
            >
              <option value="">Selecione...</option>
              {condominiums.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editing ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
