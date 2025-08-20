'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GraduationCap, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { 
  getUserByNameAndPhone, 
  getUserByName, 
  setUserPassword, 
  verifyUserPassword,
  searchUsers
} from '@/features/users/api'
import { useAuth } from '@/hooks/useAuth'

type AuthMode = 'select' | 'register' | 'login' | 'password'

export default function DirectoryAuthForm() {
  const router = useRouter()
  const { signIn } = useAuth()
  const [mode, setMode] = useState<AuthMode>('select')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // 폼 데이터
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [foundUser, setFoundUser] = useState<any>(null)
  
  // 이름 검색 관련 상태
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const resetForm = () => {
    setName('')
    setPhone('')
    setPassword('')
    setConfirmPassword('')
    setFoundUser(null)
    setSelectedUser(null)
    setSearchResults([])
    setShowDropdown(false)
    setError('')
  }

  // 이름 검색 기능
  const searchUsers = async (query: string) => {
    if (query.length < 1) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    try {
      setSearchLoading(true)
      const results = await searchUsers(query)
      setSearchResults(results)
      setShowDropdown(true)
    } catch (error) {
      console.error('사용자 검색 오류:', error)
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  // 이름 입력 시 검색 실행
  const handleNameChange = (value: string) => {
    setName(value)
    setSelectedUser(null)
    
    // 디바운싱을 위한 타이머
    const timeoutId = setTimeout(() => {
      searchUsers(value)
    }, 300)

    return () => clearTimeout(timeoutId)
  }

  // 사용자 선택
  const handleUserSelect = (user: any) => {
    setSelectedUser(user)
    setName(user.name)
    setShowDropdown(false)
    setSearchResults([])
  }

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectMode = (selectedMode: 'register' | 'login') => {
    resetForm()
    setMode(selectedMode)
  }

  const handleRegister = async () => {
    if (!selectedUser) {
      setError('목록에서 본인의 이름을 선택해주세요.')
      return
    }

    if (!phone.trim()) {
      setError('전화번호를 입력해주세요.')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const user = await getUserByNameAndPhone(selectedUser.name, phone)
      
      if (!user) {
        setError('전화번호가 일치하지 않습니다. 등록된 전화번호를 확인해주세요.')
        return
      }

      if (user.password_hash) {
        setError('이미 등록이 완료된 사용자입니다. 로그인을 이용해주세요.')
        return
      }

      setFoundUser(user)
      setMode('password')
    } catch (error: any) {
      console.error('등록 오류:', error)
      setError('등록 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!selectedUser) {
      setError('목록에서 본인의 이름을 선택해주세요.')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const user = await getUserByName(selectedUser.name)
      
      if (!user) {
        setError('등록된 사용자를 찾을 수 없습니다.')
        return
      }

      if (!user.password_hash) {
        setError('비밀번호가 설정되지 않은 사용자입니다. 참가자 등록을 먼저 해주세요.')
        return
      }

      setFoundUser(user)
      setMode('password')
    } catch (error: any) {
      console.error('로그인 오류:', error)
      setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const handleSetPassword = async () => {
    if (!password.trim()) {
      setError('비밀번호를 입력해주세요.')
      return
    }

    if (password.length !== 4 || !/^\d{4}$/.test(password)) {
      setError('4자리 숫자 비밀번호를 입력해주세요.')
      return
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      console.log('🔐 비밀번호 설정 시작:', foundUser.name)
      await setUserPassword(foundUser.id, password)
      
      // 비밀번호 설정 후 사용자 정보 다시 조회하여 password_hash 확인
      const updatedUser = await getUserByName(foundUser.name)
      console.log('🔐 비밀번호 설정 후 사용자 재조회:', {
        name: updatedUser?.name,
        hasPassword: !!updatedUser?.password_hash
      })
      
      if (updatedUser) {
        signIn(updatedUser)
      } else {
        signIn(foundUser)
      }
      
      console.log('✅ 등록 및 로그인 완료')
      router.push('/')
    } catch (error: any) {
      console.error('비밀번호 설정 오류:', error)
      setError('비밀번호 설정 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyPassword = async () => {
    if (!password.trim()) {
      setError('비밀번호를 입력해주세요.')
      return
    }

    if (password.length !== 4 || !/^\d{4}$/.test(password)) {
      setError('4자리 숫자 비밀번호를 입력해주세요.')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const isValid = await verifyUserPassword(foundUser.id, password)
      
      if (!isValid) {
        setError('비밀번호가 일치하지 않습니다.')
        return
      }

      signIn(foundUser)
      
      console.log('✅ 로그인 완료')
      router.push('/')
    } catch (error: any) {
      console.error('비밀번호 확인 오류:', error)
      setError('로그인 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      if (mode === 'register') {
        handleRegister()
      } else if (mode === 'login') {
        handleLogin()
      } else if (mode === 'password') {
        if (foundUser.password_hash) {
          handleVerifyPassword()
        } else {
          handleSetPassword()
        }
      }
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          {mode === 'select' && '로그인 방법 선택'}
          {mode === 'register' && '참가자 등록'}
          {mode === 'login' && '로그인'}
          {mode === 'password' && (foundUser?.password_hash ? '비밀번호 입력' : '비밀번호 설정')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {mode === 'select' && (
          <div className="space-y-3">
            <Button 
              onClick={() => handleSelectMode('register')} 
              className="w-full"
              variant="default"
            >
              참가자 등록
            </Button>
            <Button 
              onClick={() => handleSelectMode('login')} 
              className="w-full"
              variant="outline"
            >
              로그인
            </Button>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                💡 처음 이용하시는 분은 "참가자 등록"을 선택해주세요.
              </p>
              <p className="text-xs text-gray-500">
                등록된 이름과 전화번호로 인증 후 4자리 비밀번호를 설정하게 됩니다.
              </p>
            </div>
          </div>
        )}

        {mode === 'register' && (
          <div className="space-y-4">
            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이름
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  onFocus={() => {
                    if (searchResults.length > 0) setShowDropdown(true)
                  }}
                  placeholder="이름을 입력하여 검색하세요"
                  disabled={loading}
                  className={selectedUser ? 'border-green-500 bg-green-50' : ''}
                />
                {searchLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Search className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* 선택된 사용자 표시 */}
              {selectedUser && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-800">{selectedUser.name}</p>
                      <p className="text-xs text-green-600">
                        {selectedUser.school} {selectedUser.major} {selectedUser.generation}기
                      </p>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      선택됨
                    </Badge>
                  </div>
                </div>
              )}

              {/* 검색 결과 드롭다운 */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      className="px-4 py-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <GraduationCap className="h-3 w-3 mr-1" />
                            <span>{user.school} {user.major}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {user.generation}기
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                전화번호
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="010-1234-5678 또는 01012345678"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Button 
                onClick={handleRegister} 
                disabled={loading} 
                className="w-full"
              >
                {loading ? '확인 중...' : '참가자 인증'}
              </Button>
              <Button 
                onClick={() => setMode('select')} 
                variant="outline" 
                className="w-full"
                disabled={loading}
              >
                뒤로 가기
              </Button>
            </div>
          </div>
        )}

        {mode === 'login' && (
          <div className="space-y-4">
            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이름
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  onFocus={() => {
                    if (searchResults.length > 0) setShowDropdown(true)
                  }}
                  placeholder="이름을 입력하여 검색하세요"
                  disabled={loading}
                  className={selectedUser ? 'border-green-500 bg-green-50' : ''}
                />
                {searchLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Search className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* 선택된 사용자 표시 */}
              {selectedUser && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-800">{selectedUser.name}</p>
                      <p className="text-xs text-green-600">
                        {selectedUser.school} {selectedUser.major} {selectedUser.generation}기
                      </p>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      선택됨
                    </Badge>
                  </div>
                </div>
              )}

              {/* 검색 결과 드롭다운 */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      className="px-4 py-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <GraduationCap className="h-3 w-3 mr-1" />
                            <span>{user.school} {user.major}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {user.generation}기
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Button 
                onClick={handleLogin} 
                disabled={loading} 
                className="w-full"
              >
                {loading ? '확인 중...' : '다음'}
              </Button>
              <Button 
                onClick={() => setMode('select')} 
                variant="outline" 
                className="w-full"
                disabled={loading}
              >
                뒤로 가기
              </Button>
            </div>
          </div>
        )}

        {mode === 'password' && foundUser && (
          <div className="space-y-4">
            <div className="text-center p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>{foundUser.name}</strong>님, 안녕하세요!
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {foundUser.school} {foundUser.major} {foundUser.generation}기
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {foundUser.password_hash ? '4자리 비밀번호' : '4자리 비밀번호 설정'}
              </label>
              <Input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={password}
                onChange={(e) => setPassword(e.target.value.replace(/\D/g, ''))}
                onKeyPress={handleKeyPress}
                placeholder="4자리 숫자 입력"
                disabled={loading}
              />
            </div>

            {!foundUser.password_hash && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호 확인
                </label>
                <Input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value.replace(/\D/g, ''))}
                  onKeyPress={handleKeyPress}
                  placeholder="4자리 숫자 다시 입력"
                  disabled={loading}
                />
              </div>
            )}

            <div className="space-y-2">
              <Button 
                onClick={foundUser.password_hash ? handleVerifyPassword : handleSetPassword}
                disabled={loading} 
                className="w-full"
              >
                {loading ? '처리 중...' : foundUser.password_hash ? '로그인' : '등록 완료'}
              </Button>
              <Button 
                onClick={() => {
                  setMode('select')
                  resetForm()
                }} 
                variant="outline" 
                className="w-full"
                disabled={loading}
              >
                처음으로
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
