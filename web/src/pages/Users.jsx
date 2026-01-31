import { useState, useEffect } from 'react'
import { Plus, User, Edit, Trash2, Search, Shield } from 'lucide-react'
import api from '../services/api'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function Users() {
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER'
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData(page = 1) {
    setLoading(true)
    try {
      const response = await api.get('/users', {
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
        email: item.email,
        password: '',
        role: item.role
      })
    } else {
      setEditing(null)
      setForm({
        name: '',
        email: '',
        password: '',
        role: 'USER'
      })
    }
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const data = { ...form }
      if (!data.password) delete data.password

      if (editing) {
        await api.put(`/users/${editing.id}`, data)
        toast.success('Usuário atualizado!')
      } else {
        await api.post('/auth/register', data)
        toast.success('Usuário criado!')
      }
      setModalOpen(false)
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao salvar')
    }
  }

  async function handleDelete(item) {
    if (!confirm(`Remover usuário "${item.name}"?`)) return
    
    try {
      await api.delete(`/users/${item.id}`)
      toast.success('Removido!')
      loadData()
    } catch (error) {
      toast.error('Erro ao remover')
    }
  }

  const roleColors = {
    SUPER_ADMIN: 'bg-red-100 text-red-700',
    ADMIN: 'bg-purple-100 text-purple-700',
    MANAGER: 'bg-blue-100 text-blue-700',
    OPERATOR: 'bg-green-100 text-green-700',
    USER: 'bg-gray-100 text-gray-700'
  }

  const roleLabels = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Administrador',
    MANAGER: 'Gerente',
    OPERATOR: 'Operador',
    USER: 'Usuário'
  }

  const columns = [
    { 
      header: 'Usuário', 
      render: row => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="font-medium text-gray-800">{row.name}</p>
            <p className="text-sm text-gray-500">{row.email}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Função', 
      render: row => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${roleColors[row.role]}`}>
          {roleLabels[row.role]}
        </span>
      )
    },
    { 
      header: 'Status', 
      render: row => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          row.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {row.active ? 'Ativo' : 'Inativo'}
        </span>
      )
    },
    { 
      header: 'Último Login', 
      render: row => row.lastLogin 
        ? format(new Date(row.lastLogin), 'dd/MM/yyyy HH:mm') 
        : 'Nunca'
    },
    {
      header: 'Ações',
      render: row => (
        <div className="flex items-center gap-1">
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
          <h1 className="text-2xl font-bold text-gray-800">Usuários</h1>
          <p className="text-gray-500">Gerencie usuários do sistema</p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Novo Usuário
        </button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
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
        title={editing ? 'Editar Usuário' : 'Novo Usuário'}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha {editing ? '(deixe em branco para manter)' : '*'}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="input"
              required={!editing}
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Função</label>
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              className="input"
            >
              <option value="USER">Usuário</option>
              <option value="OPERATOR">Operador</option>
              <option value="MANAGER">Gerente</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editing ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
