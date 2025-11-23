// auth.service.js
// Utilitários para extrair e verificar papéis (roles) a partir do payload do JWT

export function extractRoles(payload) {
  if (!payload) return [];

  const rolesSet = new Set();

  // Se o payload contém UserDetails como string ou objeto, preferimos extrair dali também
  let ud = null;
  if (payload.UserDetails) {
    if (typeof payload.UserDetails === 'string') {
      try {
        ud = JSON.parse(payload.UserDetails);
      } catch (e) {
        // ignora
      }
    } else if (typeof payload.UserDetails === 'object') ud = payload.UserDetails;
  }

  // campo simples: payload.role
  if (payload.role && typeof payload.role === "string") {
    rolesSet.add(payload.role.toUpperCase());
  }

  // array simples: payload.roles = ["ADMIN","DEVELOPER"] ou [{name: 'ADMIN'}]
  if (Array.isArray(payload.roles)) {
    payload.roles.forEach((r) => {
      if (!r) return;
      if (typeof r === "string") rolesSet.add(r.toUpperCase());
      else if (r.name) rolesSet.add(String(r.name).toUpperCase());
    });
  }

  // se existir objeto UserDetails com roleTypes ou authorities ou cargo
  if (ud) {
    if (Array.isArray(ud.roleTypes)) ud.roleTypes.forEach(r => rolesSet.add(String(r).toUpperCase()));
    if (Array.isArray(ud.authorities)) ud.authorities.forEach(a => rolesSet.add(String(a).toUpperCase()));
    if (ud.cargo && typeof ud.cargo === 'string') rolesSet.add(String(ud.cargo).toUpperCase());
    // alguns backends usam 'roles' dentro de userDetails
    if (Array.isArray(ud.roles)) ud.roles.forEach(r => rolesSet.add(String(r).toUpperCase()));
  }

  // authorities comum em alguns tokens
  if (Array.isArray(payload.authorities)) {
    payload.authorities.forEach((a) => {
      if (!a) return;
      if (typeof a === "string") rolesSet.add(a.replace(/^ROLE_/, "").toUpperCase());
      else if (a.authority) rolesSet.add(a.authority.replace(/^ROLE_/, "").toUpperCase());
    });
  }

  // Keycloak style: realm_access.roles
  if (payload.realm_access && Array.isArray(payload.realm_access.roles)) {
    payload.realm_access.roles.forEach((r) => rolesSet.add(String(r).toUpperCase()));
  }

  // resource_access: { clientId: { roles: [...] } }
  if (payload.resource_access && typeof payload.resource_access === "object") {
    Object.values(payload.resource_access).forEach((client) => {
      if (client && Array.isArray(client.roles)) client.roles.forEach((r) => rolesSet.add(String(r).toUpperCase()));
    });
  }

  return Array.from(rolesSet);
}

export function hasAnyRole(payload, allowedRoles = []) {
  if (!payload) return false;
  const roles = extractRoles(payload);
  const upperAllowed = allowedRoles.map((r) => String(r).toUpperCase());
  return upperAllowed.some((a) => roles.includes(a));
}

export function getPrimaryRole(payload, priority = ["ADMIN", "ETL", "MANAGER", "DEVELOPER"]) {
  const roles = extractRoles(payload);
  for (const p of priority) if (roles.includes(p)) return p;
  return roles[0] || null;
}

export default {
  extractRoles,
  hasAnyRole,
  getPrimaryRole,
};
