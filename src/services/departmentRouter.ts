import { ComplaintCategory, Department } from '../types';
import { DEPARTMENTS, DEPARTMENT_RULES } from '../data/seedData';

export interface RoutingDecision {
  department: Department;
  priority: 'Immediate' | 'High' | 'Normal';
  slaHours: number;
  reason: string;
}

/**
 * Automatic Department Routing Engine
 * SPECIFICATION RULES:
 * - Garbage Overflow -> Solid Waste Management
 * - Illegal Dumping -> Solid Waste Management
 * - Pothole -> Road Department
 * - Road Damage -> Road Department
 * - Water Leakage -> Water Supply / Hydraulic Department
 * - Broken Streetlight -> Electrical Department
 * - Drainage Blockage -> Drainage Department
 * - Fallen Tree -> Tree / Garden Department
 * - Others -> Ward Office / Manual Review
 *
 * Final routing depends on:
 * Problem Category + City + Ward
 */
export function routeComplaint(
  category: ComplaintCategory,
  city: string = 'Mumbai',
  demoWardNumber: string = 'Demo Ward 01'
): RoutingDecision {
  // Check explicit department rules first
  const rule = DEPARTMENT_RULES.find(
    (r) => r.active && r.category === category && (r.wardNumber === 'ALL' || r.wardNumber === demoWardNumber)
  );

  let targetDeptId = rule ? rule.departmentId : 'dept_ward_office';
  let priority = rule ? rule.priority : 'Normal';

  // Fallback map if rule not found
  if (!rule) {
    switch (category) {
      case 'garbage_overflow':
      case 'illegal_dumping':
        targetDeptId = 'dept_swm';
        priority = 'High';
        break;
      case 'pothole':
        targetDeptId = 'dept_roads';
        priority = 'High';
        break;
      case 'road_damage':
        targetDeptId = 'dept_roads';
        priority = 'Normal';
        break;
      case 'water_leakage':
        targetDeptId = 'dept_water';
        priority = 'Immediate';
        break;
      case 'broken_streetlight':
        targetDeptId = 'dept_electrical';
        priority = 'Normal';
        break;
      case 'drainage_blockage':
        targetDeptId = 'dept_drainage';
        priority = 'High';
        break;
      case 'fallen_tree':
        targetDeptId = 'dept_garden';
        priority = 'Immediate';
        break;
      default:
        targetDeptId = 'dept_ward_office';
        priority = 'Normal';
        break;
    }
  }

  const department = DEPARTMENTS.find((d) => d.id === targetDeptId) || DEPARTMENTS[DEPARTMENTS.length - 1];

  const slaHours = priority === 'Immediate' ? 12 : priority === 'High' ? 24 : 48;

  const reason = `Auto-routed to ${department.departmentName} based on category '${getCategoryLabel(category)}' in ${city} (${demoWardNumber}).`;

  return {
    department,
    priority,
    slaHours,
    reason,
  };
}

export function getCategoryLabel(category: ComplaintCategory): string {
  const map: Record<ComplaintCategory, string> = {
    garbage_overflow: 'Garbage Overflow',
    illegal_dumping: 'Illegal Dumping',
    pothole: 'Pothole',
    road_damage: 'Road Damage',
    water_leakage: 'Water Leakage',
    broken_streetlight: 'Broken Streetlight',
    drainage_blockage: 'Drainage Blockage',
    fallen_tree: 'Fallen Tree',
    others: 'Other Civic Problems',
  };
  return map[category] || category;
}
