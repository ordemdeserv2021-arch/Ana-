import { useState, useEffect } from 'react'
import { Plus, User, Edit, Trash2, Search, Ban, CheckCircle, CreditCard } from 'lucide-react'
import api from '../services/api'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import toast from 'react-hot-toast'

export default function Residents() {
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [condominiums, setCondominiums] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [credentialModalOpen, setCredentialModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [selectedResident, setSelectedResident] = useState(null)
  const [form, setForm] = useState({
    name: '',
    document: '',
    email: '',
    phone: '',
    unit: '',
    block: '',
    type: 'RESIDENT',
    condominiumId: ''
  })
  const [credentialForm, setCredentialForm] = useState({
    type: 'CARD',
    value: ''
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
      console.error('Erro ao carregar condomínios:', error)
    }
  }

  async function loadData(page = 1) {
    setLoading(true)
    try {
      const response = await api.get('/residents', {
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
        document: item.document,
        email: item.email || '',
        phone: item.phone || '',
        unit: item.unit || '',
        block: item.block || '',
        type: item.type,
        condominiumId: item.condominiumId
      })
    } else {
      setEditing(null)
      setForm({
        name: '',
        document: '',
        email: '',
        phone: '',
        unit: '',
        block: '',
        type: 'RESIDENT',
        condominiumId: condominiums[0]?.id || ''
      })
    }
    setModalOpen(true)
  }

  function openCredentialModal(resident) {
    setSelectedResident(resident)
    setCredentialForm({ type: 'CARD', value: '' })
    setCredentialModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      if (editing) {
        await api.put(`/residents/${editing.id}`, form)
        toast.success('Morador atualizado!')
      } else {
        await api.post('/residents', form)
        toast.success('Morador cadastrado!')
      }
      setModalOpen(false)
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao salvar')
    }
  }

  async function handleAddCredential(e) {
    e.preventDefault()
    try {
      await api.post(`/residents/${selectedResident.id}/credentials`, credentialForm)
      toast.success('Credencial adicionada!')
      setCredentialModalOpen(false)
      loadData()
    } catch (error) {
      toast.error('Erro ao adicionar credencial')
    }
  }

  async function handleBlock(resident) {
    const action = resident.blocked ? 'unblock' : 'block'
    const message = resident.blocked ? 'Desbloquear acesso?' : 'Bloquear acesso?'
    
    if (!confirm(message)) return

    try {
      await api.put(`/residents/${resident.id}/${action}`, {
        reason: 'Bloqueio manual pelo administrador'
      })
      toast.success(resident.blocked ? 'Acesso desbloqueado!' : 'Acesso bloqueado!')
      loadData()
    } catch (error) {
      toast.error('Erro ao alterar status')
    }
  }

  async function handleDelete(item) {
    if (!confirm(`Deseja remover "${item.name}"?`)) return
    
    try {
      await api.delete(`/residents/${item.id}`)
      toast.success('Removido com sucesso!')
      loadData()
    } catch (error) {
      toast.error('Erro ao remover')
    }
  }

  const columns = [
    { 
      header: 'Morador', 
      render: row => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            row.blocked ? 'bg-red-100' : 'bg-primary-100'
          }`}>
            <User className={`w-5 h-5 ${row.blocked ? 'text-red-600' : 'text-primary-600'}`} />
          </div>
          <div>
            <p className="font-medium text-gray-800">{row.name}</p>
            <p className="text-sm text-gray-500">{row.document}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Unidade', 
      render: row => row.unit ? `${row.block || ''} ${row.unit}`.trim() : '-'
    },
    { 
      header: 'Condomínio', 
      render: row => row.condominium?.name || '-'
    },
    { 
      header: 'Tipo', 
      render: row => {
        const types = {
          RESIDENT: { label: 'Morador', class: 'bg-blue-100 text-blue-700' },
          EMPLOYEE: { label: 'Funcionário', class: 'bg-green-100 text-green-700' },
          PROVIDER: { label: 'Prestador', class: 'bg-yellow-100 text-yellow-700' },
          TENANT: { label: 'Inquilino', class: 'bg-purple-100 text-purple-700' }
        }
        const type = types[row.type] || types.RESIDENT
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${type.class}`}>
            {type.label}
          </span>
        )
      }
    },
    { 
      header: 'Status', 
      render: row => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          row.blocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {row.blocked ? 'Bloqueado' : 'Ativo'}
        </span>
      )
    },
    {
      header: 'Ações',
      render: row => (
        <div className="flex items-center gap-1">
          <button 
            onClick={() => openCredentialModal(row)}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title="Adicionar credencial"
          >
            <CreditCard className="w-4 h-4 text-gray-600" />
          </button>
          <button 
            onClick={() => handleBlock(row)}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title={row.blocked ? 'Desbloquear' : 'Bloquear'}
          >
            {row.blocked ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <Ban className="w-4 h-4 text-yellow-600" />
            )}
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
          <h1 className="text-2xl font-bold text-gray-800">Moradores</h1>
          <p className="text-gray-500">Gerencie moradores e funcionários</p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Novo Morador
        </button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, documento ou unidade..."
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

      {/* Modal Morador */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Morador' : 'Novo Morador'}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF/Documento *</label>
              <input
                type="text"
                value={form.document}
                onChange={e => setForm({ ...form, document: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
                className="input"
              >
                <option value="RESIDENT">Morador</option>
                <option value="EMPLOYEE">Funcionário</option>
                <option value="PROVIDER">Prestador</option>
                <option value="TENANT">Inquilino</option>
              </select>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Bloco</label>
              <input
                type="text"
                value={form.block}
                onChange={e => setForm({ ...form, block: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
              <input
                type="text"
                value={form.unit}
                onChange={e => setForm({ ...form, unit: e.target.value })}
                className="input"
              />
            </div>

            <div className="col-span-2">
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

      {/* Modal Credencial */}
      <Modal
        isOpen={credentialModalOpen}
        onClose={() => setCredentialModalOpen(false)}
        title="Adicionar Credencial"
        size="sm"
      >
        <form onSubmit={handleAddCredential} className="space-y-4">
          <p className="text-sm text-gray-500">
            Adicionando credencial para: <strong>{selectedResident?.name}</strong>
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={credentialForm.type}
              onChange={e => setCredentialForm({ ...credentialForm, type: e.target.value })}
              className="input"
            >
              <option value="CARD">Cartão</option>
              <option value="BIOMETRIC">Biometria</option>
              <option value="FACIAL">Reconhecimento Facial</option>
              <option value="QR_CODE">QR Code</option>
              <option value="PIN">Senha</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor/Código *</label>
            <input
              type="text"
              value={credentialForm.value}
              onChange={e => setCredentialForm({ ...credentialForm, value: e.target.value })}
              className="input"
              placeholder="Número do cartão, código, etc..."
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setCredentialModalOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Adicionar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
