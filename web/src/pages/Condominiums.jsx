import { useState, useEffect } from 'react'
import { Plus, Building2, Edit, Trash2, Search } from 'lucide-react'
import api from '../services/api'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import toast from 'react-hot-toast'

export default function Condominiums() {
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    name: '',
    address: '',
    type: 'CONDOMINIUM',
    phone: '',
    email: '',
    cnpj: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData(page = 1) {
    setLoading(true)
    try {
      const response = await api.get('/condominiums', {
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

  function openModal(item = null) {
    if (item) {
      setEditing(item)
      setForm({
        name: item.name,
        address: item.address,
        type: item.type,
        phone: item.phone || '',
        email: item.email || '',
        cnpj: item.cnpj || ''
      })
    } else {
      setEditing(null)
      setForm({
        name: '',
        address: '',
        type: 'CONDOMINIUM',
        phone: '',
        email: '',
        cnpj: ''
      })
    }
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      if (editing) {
        await api.put(`/condominiums/${editing.id}`, form)
        toast.success('Atualizado com sucesso!')
      } else {
        await api.post('/condominiums', form)
        toast.success('Cadastrado com sucesso!')
      }
      setModalOpen(false)
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao salvar')
    }
  }

  async function handleDelete(item) {
    if (!confirm(`Deseja realmente excluir "${item.name}"?`)) return
    
    try {
      await api.delete(`/condominiums/${item.id}`)
      toast.success('Removido com sucesso!')
      loadData()
    } catch (error) {
      toast.error('Erro ao remover')
    }
  }

  const columns = [
    { 
      header: 'Nome', 
      render: row => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="font-medium text-gray-800">{row.name}</p>
            <p className="text-sm text-gray-500">{row.address}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Tipo', 
      render: row => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          row.type === 'CONDOMINIUM' 
            ? 'bg-blue-100 text-blue-700' 
            : 'bg-purple-100 text-purple-700'
        }`}>
          {row.type === 'CONDOMINIUM' ? 'Condomínio' : 'Comercial'}
        </span>
      )
    },
    { 
      header: 'Moradores', 
      render: row => row._count?.residents || 0
    },
    { 
      header: 'Dispositivos', 
      render: row => row._count?.devices || 0
    },
    {
      header: 'Ações',
      render: row => (
        <div className="flex items-center gap-2">
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
          <h1 className="text-2xl font-bold text-gray-800">Condomínios</h1>
          <p className="text-gray-500">Gerencie condomínios e estabelecimentos</p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Novo Cadastro
        </button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou endereço..."
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
        title={editing ? 'Editar Condomínio' : 'Novo Condomínio'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Endereço *</label>
            <input
              type="text"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              className="input"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
                className="input"
              >
                <option value="CONDOMINIUM">Condomínio</option>
                <option value="COMMERCIAL">Comercial</option>
                <option value="INDUSTRIAL">Industrial</option>
                <option value="MIXED">Uso Misto</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
              <input
                type="text"
                value={form.cnpj}
                onChange={e => setForm({ ...form, cnpj: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="input"
              />
            </div>
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
