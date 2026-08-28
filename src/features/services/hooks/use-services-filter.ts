'use client'

import { useMemo, useState } from 'react'
import { SERVICES_LIST } from '../constants/services-data'
import type { ServiceCategoryId, ServiceDefinition } from '../types'

export function useServicesFilter() {
  const [activeCategory, setActiveCategory] = useState<ServiceCategoryId>('all')

  const filteredServices = useMemo<ServiceDefinition[]>(() => {
    if (activeCategory === 'all') {
      return SERVICES_LIST
    }
    return SERVICES_LIST.filter((service) => service.category === activeCategory)
  }, [activeCategory])

  return {
    activeCategory,
    setActiveCategory,
    filteredServices,
    servicesCount: filteredServices.length,
  }
}
