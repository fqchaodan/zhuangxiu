/**
 * 装修分类树
 *
 * 三级结构：主类 → 子类 → 细类，key 由层级短码自动拼接，例如：
 * hard.main.tile.kitchen-wall（硬装 / 主材 / 瓷砖 / 厨房墙砖）
 *
 * 条目可以挂在任意层级：整套中央空调按整体价记账时，直接挂在 hard.hvac.ac 上，
 * 不必拆成室内机 / 室外机分别录入。
 * 新增细类只需在下面的种子数据里加一行，页面无需改动。
 */
import type { SideType } from '@/types/renovation'

export interface CategoryNode {
  /** 全路径 key */
  key: string
  label: string
  /** 默认单位；中间层级没有单位，按「项」处理且可手动改 */
  unit?: string
  icon?: string
  children?: CategoryNode[]
}

interface CategorySeed {
  k: string
  label: string
  unit?: string
  icon?: string
  children?: CategorySeed[]
}

function build(prefix: string, seeds: CategorySeed[]): CategoryNode[] {
  return seeds.map((seed) => {
    const key = `${prefix}.${seed.k}`
    return {
      key,
      label: seed.label,
      unit: seed.unit,
      icon: seed.icon,
      children: seed.children ? build(key, seed.children) : undefined
    }
  })
}

/** 硬装：暖通 / 门窗 / 主材 / 辅材 / 全屋定制 / 成品家具 */
const hardSeed: CategorySeed[] = [
  {
    k: 'hvac',
    label: '暖通',
    icon: 'ri:temp-cold-line',
    children: [
      {
        k: 'ac',
        label: '中央空调',
        children: [
          { k: 'indoor', label: '室内机', unit: '台' },
          { k: 'outdoor', label: '室外机', unit: '台' },
          { k: 'copper', label: '铜管保温', unit: 'm' },
          { k: 'drain', label: '冷凝水管', unit: 'm' },
          { k: 'vent', label: '风口', unit: '个' },
          { k: 'controller', label: '线控器', unit: '个' },
          { k: 'kit', label: '安装辅材', unit: '项' }
        ]
      },
      {
        k: 'fresh',
        label: '新风系统',
        children: [
          { k: 'host', label: '新风机', unit: '台' },
          { k: 'duct', label: '风管', unit: 'm' },
          { k: 'vent', label: '风口', unit: '个' },
          { k: 'filter', label: '滤网', unit: '套' },
          { k: 'panel', label: '控制面板', unit: '个' }
        ]
      },
      {
        k: 'floor-heat',
        label: '地暖',
        children: [
          { k: 'heat-source', label: '热源主机', unit: '台' },
          { k: 'manifold', label: '分集水器', unit: '套' },
          { k: 'pipe', label: '地暖盘管', unit: '㎡' },
          { k: 'insulation', label: '保温板', unit: '㎡' },
          { k: 'film', label: '反射膜', unit: '㎡' },
          { k: 'backfill', label: '回填层', unit: '㎡' },
          { k: 'thermostat', label: '温控器', unit: '个' }
        ]
      },
      {
        k: 'radiator',
        label: '暖气片',
        children: [
          { k: 'radiator', label: '暖气片', unit: '组' },
          { k: 'pipe', label: '管道', unit: 'm' },
          { k: 'valve', label: '阀门', unit: '个' },
          { k: 'boiler', label: '壁挂炉', unit: '台' }
        ]
      },
      {
        k: 'water',
        label: '净水系统',
        children: [
          { k: 'pre-filter', label: '前置过滤器', unit: '台' },
          { k: 'central', label: '中央净水机', unit: '台' },
          { k: 'softener', label: '软水机', unit: '台' },
          { k: 'ro', label: '末端直饮机', unit: '台' },
          { k: 'dispenser', label: '管线机', unit: '台' }
        ]
      },
      {
        k: 'hot-water',
        label: '热水系统',
        children: [
          { k: 'gas', label: '燃气热水器', unit: '台' },
          { k: 'electric', label: '电热水器', unit: '台' },
          { k: 'pump', label: '循环泵', unit: '台' },
          { k: 'return-pipe', label: '回水管', unit: 'm' }
        ]
      }
    ]
  },
  {
    k: 'door-window',
    label: '门窗',
    icon: 'ri:door-open-line',
    children: [
      {
        k: 'entry',
        label: '入户门',
        children: [
          { k: 'door', label: '防盗门', unit: '樘' },
          { k: 'frame', label: '门套', unit: '套' },
          { k: 'threshold', label: '门槛石', unit: '块' },
          { k: 'lock', label: '智能门锁', unit: '把' },
          { k: 'hardware', label: '五金', unit: '套' }
        ]
      },
      {
        k: 'interior',
        label: '室内门',
        children: [
          { k: 'wood', label: '木门', unit: '樘' },
          { k: 'sliding', label: '推拉门', unit: '樘' },
          { k: 'folding', label: '折叠门', unit: '樘' },
          { k: 'hidden', label: '隐形门', unit: '樘' },
          { k: 'frame', label: '门套/垭口', unit: '套' },
          { k: 'hardware', label: '五金', unit: '套' }
        ]
      },
      {
        k: 'window',
        label: '窗户',
        children: [
          { k: 'broken-bridge', label: '断桥铝窗', unit: '㎡' },
          { k: 'system', label: '系统窗', unit: '㎡' },
          { k: 'screen', label: '纱窗', unit: '个' },
          { k: 'glass', label: '玻璃', unit: '㎡' },
          { k: 'sill', label: '窗台石', unit: '块' },
          { k: 'casing', label: '窗套', unit: '套' }
        ]
      },
      {
        k: 'balcony',
        label: '阳台',
        children: [
          { k: 'enclosure', label: '封阳台', unit: '㎡' },
          { k: 'sunroom', label: '阳光房', unit: '㎡' },
          { k: 'railing', label: '防护栏', unit: 'm' }
        ]
      }
    ]
  },
  {
    k: 'main',
    label: '主材',
    icon: 'ri:home-4-line',
    children: [
      {
        k: 'tile',
        label: '瓷砖',
        children: [
          { k: 'kitchen-wall', label: '厨房墙砖', unit: '㎡' },
          { k: 'kitchen-floor', label: '厨房地砖', unit: '㎡' },
          { k: 'bath-wall', label: '卫生间墙砖', unit: '㎡' },
          { k: 'bath-floor', label: '卫生间地砖', unit: '㎡' },
          { k: 'living-floor', label: '客厅地砖', unit: '㎡' },
          { k: 'dining-floor', label: '餐厅地砖', unit: '㎡' },
          { k: 'bedroom-floor', label: '卧室地砖', unit: '㎡' },
          { k: 'balcony', label: '阳台砖', unit: '㎡' },
          { k: 'threshold', label: '过门石', unit: '块' },
          { k: 'skirting', label: '踢脚线', unit: 'm' },
          { k: 'grout', label: '美缝剂', unit: '㎡' },
          { k: 'trim', label: '收边条', unit: '根' }
        ]
      },
      {
        k: 'floor',
        label: '地板',
        children: [
          { k: 'solid', label: '实木地板', unit: '㎡' },
          { k: 'multi-layer', label: '实木复合地板', unit: '㎡' },
          { k: 'laminate', label: '强化复合地板', unit: '㎡' },
          { k: 'skirting', label: '踢脚线', unit: 'm' },
          { k: 'trim', label: '扣条', unit: '根' },
          { k: 'underlay', label: '防潮垫', unit: '㎡' }
        ]
      },
      {
        k: 'stone',
        label: '石材',
        children: [
          { k: 'countertop', label: '厨房台面', unit: 'm' },
          { k: 'sill', label: '窗台石', unit: '块' },
          { k: 'threshold', label: '过门石', unit: '块' },
          { k: 'backsplash', label: '挡水条', unit: 'm' }
        ]
      },
      {
        k: 'bath',
        label: '卫浴',
        children: [
          { k: 'toilet', label: '马桶', unit: '个' },
          { k: 'shower', label: '花洒', unit: '套' },
          { k: 'vanity', label: '浴室柜', unit: '套' },
          { k: 'basin', label: '台盆', unit: '个' },
          { k: 'faucet', label: '龙头', unit: '个' },
          { k: 'drain', label: '地漏', unit: '个' },
          { k: 'valve', label: '角阀', unit: '个' },
          { k: 'shower-room', label: '淋浴房', unit: '套' },
          { k: 'bathtub', label: '浴缸', unit: '个' },
          { k: 'accessories', label: '五金挂件', unit: '套' }
        ]
      },
      {
        k: 'ceiling',
        label: '厨卫吊顶',
        children: [
          { k: 'aluminum', label: '铝扣板', unit: '㎡' },
          { k: 'honeycomb', label: '蜂窝大板', unit: '㎡' },
          { k: 'heater', label: '浴霸', unit: '台' },
          { k: 'exhaust', label: '排风扇', unit: '台' },
          { k: 'keel', label: '龙骨', unit: '㎡' }
        ]
      },
      {
        k: 'light',
        label: '灯具',
        children: [
          { k: 'main', label: '主灯', unit: '个' },
          { k: 'downlight', label: '筒灯', unit: '个' },
          { k: 'spotlight', label: '射灯', unit: '个' },
          { k: 'strip', label: '灯带', unit: 'm' },
          { k: 'track', label: '轨道灯', unit: '个' },
          { k: 'wall', label: '壁灯', unit: '个' }
        ]
      },
      {
        k: 'electric',
        label: '电气',
        children: [
          { k: 'switch', label: '开关面板', unit: '个' },
          { k: 'socket', label: '插座面板', unit: '个' },
          { k: 'breaker', label: '空开漏保', unit: '个' },
          { k: 'box', label: '配电箱', unit: '套' },
          { k: 'weak-box', label: '弱电箱', unit: '套' }
        ]
      },
      {
        k: 'wall',
        label: '墙面',
        children: [
          { k: 'paint', label: '乳胶漆', unit: '㎡' },
          { k: 'wallpaper', label: '壁纸/壁布', unit: '㎡' },
          { k: 'panel', label: '护墙板', unit: '㎡' },
          { k: 'art-paint', label: '艺术漆', unit: '㎡' }
        ]
      }
    ]
  },
  {
    k: 'aux',
    label: '辅材',
    icon: 'ri:tools-line',
    children: [
      {
        k: 'plumbing',
        label: '水电',
        children: [
          { k: 'ppr', label: 'PPR 给水管', unit: 'm' },
          { k: 'wire', label: '电线', unit: 'm' },
          { k: 'network', label: '网络线', unit: 'm' },
          { k: 'conduit', label: '穿线管', unit: 'm' },
          { k: 'drain-pipe', label: '排水管', unit: 'm' },
          { k: 'electric-kit', label: '电气配套', unit: '套' }
        ]
      },
      {
        k: 'wood',
        label: '木工',
        children: [
          { k: 'keel', label: '轻钢龙骨', unit: '㎡' },
          { k: 'wood-keel', label: '木龙骨', unit: 'm' },
          { k: 'gypsum', label: '纸面石膏板', unit: '张' },
          { k: 'osb', label: '欧松板', unit: '张' },
          { k: 'glue', label: '白乳胶', unit: '桶' },
          { k: 'backer', label: '防水背衬板', unit: '张' }
        ]
      },
      {
        k: 'masonry',
        label: '泥作',
        children: [
          { k: 'cement', label: '水泥及砂', unit: '袋' },
          { k: 'mortar', label: '找平砂浆', unit: '袋' },
          { k: 'tile-glue', label: '瓷砖胶', unit: '袋' },
          { k: 'back-glue', label: '瓷砖背胶', unit: '桶' },
          { k: 'leveler', label: '找平器', unit: '包' }
        ]
      },
      {
        k: 'waterproof',
        label: '防水',
        children: [
          { k: 'coating', label: '防水涂料', unit: '桶' },
          { k: 'plugging', label: '堵漏王', unit: '袋' }
        ]
      },
      {
        k: 'paint',
        label: '油工',
        children: [
          { k: 'primer', label: '界面剂/墙固', unit: '桶' },
          { k: 'putty', label: '腻子', unit: '袋' },
          { k: 'plaster', label: '石膏类', unit: '袋' },
          { k: 'paint', label: '乳胶漆', unit: '桶' }
        ]
      }
    ]
  },
  {
    k: 'custom',
    label: '全屋定制',
    icon: 'ri:archive-line',
    children: [
      {
        k: 'cabinet',
        label: '橱柜',
        children: [
          { k: 'base', label: '地柜', unit: 'm' },
          { k: 'wall', label: '吊柜', unit: 'm' },
          { k: 'tall', label: '高柜', unit: '组' },
          { k: 'countertop', label: '台面', unit: 'm' },
          { k: 'hardware', label: '五金', unit: '套' },
          { k: 'panel', label: '见光板', unit: '㎡' }
        ]
      },
      {
        k: 'wardrobe',
        label: '衣柜',
        children: [
          { k: 'master', label: '主卧衣柜', unit: '㎡' },
          { k: 'second', label: '次卧衣柜', unit: '㎡' },
          { k: 'cloakroom', label: '衣帽间', unit: '㎡' },
          { k: 'door', label: '门板', unit: '㎡' },
          { k: 'hardware', label: '五金', unit: '套' }
        ]
      },
      {
        k: 'entry',
        label: '玄关',
        children: [
          { k: 'shoe', label: '鞋柜', unit: '㎡' },
          { k: 'bench', label: '换鞋凳', unit: '个' },
          { k: 'cabinet', label: '玄关柜', unit: '㎡' }
        ]
      },
      {
        k: 'living',
        label: '客餐厅',
        children: [
          { k: 'tv', label: '电视柜', unit: '㎡' },
          { k: 'sideboard', label: '餐边柜', unit: '㎡' },
          { k: 'wine', label: '酒柜', unit: '㎡' },
          { k: 'bookshelf', label: '书柜', unit: '㎡' }
        ]
      },
      {
        k: 'other',
        label: '其他定制',
        children: [
          { k: 'balcony', label: '阳台柜', unit: '㎡' },
          { k: 'tatami', label: '榻榻米', unit: '㎡' },
          { k: 'laundry', label: '洗衣柜', unit: '㎡' },
          { k: 'bath', label: '浴室柜', unit: '套' }
        ]
      }
    ]
  },
  {
    k: 'furniture',
    label: '成品家具',
    icon: 'ri:sofa-line',
    children: [
      {
        k: 'living',
        label: '客厅',
        children: [
          { k: 'sofa', label: '沙发', unit: '件' },
          { k: 'coffee', label: '茶几', unit: '件' },
          { k: 'side', label: '边几', unit: '件' },
          { k: 'chair', label: '单椅', unit: '件' }
        ]
      },
      {
        k: 'dining',
        label: '餐厅',
        children: [
          { k: 'table', label: '餐桌', unit: '件' },
          { k: 'chair', label: '餐椅', unit: '把' }
        ]
      },
      {
        k: 'bedroom',
        label: '卧室',
        children: [
          { k: 'bed', label: '床', unit: '件' },
          { k: 'mattress', label: '床垫', unit: '件' },
          { k: 'nightstand', label: '床头柜', unit: '件' },
          { k: 'dresser', label: '斗柜', unit: '件' },
          { k: 'vanity', label: '梳妆台', unit: '件' }
        ]
      },
      {
        k: 'study',
        label: '书房',
        children: [
          { k: 'desk', label: '书桌', unit: '件' },
          { k: 'chair', label: '书椅', unit: '把' },
          { k: 'shelf', label: '书架', unit: '件' }
        ]
      },
      {
        k: 'other',
        label: '其他',
        children: [
          { k: 'kids', label: '儿童家具', unit: '件' },
          { k: 'outdoor', label: '户外家具', unit: '件' }
        ]
      }
    ]
  }
]

/** 软装：家电 / 智能家居 / 装饰 */
const softSeed: CategorySeed[] = [
  {
    k: 'appliance',
    label: '家电',
    icon: 'ri:tv-2-line',
    children: [
      {
        k: 'big',
        label: '大家电',
        children: [
          { k: 'fridge', label: '冰箱', unit: '台' },
          { k: 'washer', label: '洗衣机', unit: '台' },
          { k: 'dryer', label: '烘干机', unit: '台' },
          { k: 'washer-dryer', label: '洗烘一体机', unit: '台' },
          { k: 'tv', label: '电视', unit: '台' },
          { k: 'aircon', label: '空调', unit: '台' },
          { k: 'hood', label: '油烟机', unit: '台' },
          { k: 'stove', label: '灶具', unit: '台' },
          { k: 'oven', label: '蒸烤箱', unit: '台' },
          { k: 'dishwasher', label: '洗碗机', unit: '台' },
          { k: 'sterilizer', label: '消毒柜', unit: '台' }
        ]
      },
      {
        k: 'small',
        label: '小家电',
        children: [
          { k: 'rice-cooker', label: '电饭煲', unit: '台' },
          { k: 'microwave', label: '微波炉', unit: '台' },
          { k: 'air-fryer', label: '空气炸锅', unit: '台' },
          { k: 'coffee', label: '咖啡机', unit: '台' },
          { k: 'robot', label: '扫地机器人', unit: '台' },
          { k: 'vacuum', label: '吸尘器', unit: '台' },
          { k: 'water', label: '净饮机', unit: '台' }
        ]
      },
      {
        k: 'kitchen',
        label: '厨房电器',
        children: [
          { k: 'disposal', label: '垃圾处理器', unit: '台' },
          { k: 'purifier', label: '净水器', unit: '台' },
          { k: 'cooler', label: '凉霸', unit: '台' }
        ]
      }
    ]
  },
  {
    k: 'smart',
    label: '智能家居',
    icon: 'ri:robot-2-line',
    children: [
      {
        k: 'hub',
        label: '中控网关',
        children: [
          { k: 'gateway', label: '网关', unit: '台' },
          { k: 'panel', label: '中控屏', unit: '台' },
          { k: 'speaker', label: '智能音箱', unit: '台' }
        ]
      },
      {
        k: 'lighting',
        label: '智能照明',
        children: [
          { k: 'switch', label: '智能开关', unit: '个' },
          { k: 'bulb', label: '智能灯泡', unit: '个' },
          { k: 'strip', label: '灯带控制器', unit: '个' },
          { k: 'dimmer', label: '调光模块', unit: '个' }
        ]
      },
      {
        k: 'security',
        label: '智能安防',
        children: [
          { k: 'lock', label: '智能门锁', unit: '把' },
          { k: 'camera', label: '摄像头', unit: '台' },
          { k: 'doorbell', label: '可视门铃', unit: '台' },
          { k: 'sensor', label: '门窗传感器', unit: '个' },
          { k: 'alarm', label: '水浸/烟感/燃气报警', unit: '个' }
        ]
      },
      {
        k: 'curtain',
        label: '智能遮阳',
        children: [
          { k: 'motor', label: '窗帘电机', unit: '台' },
          { k: 'track', label: '轨道', unit: 'm' },
          { k: 'roller', label: '卷帘', unit: '㎡' }
        ]
      },
      {
        k: 'env',
        label: '环境控制',
        children: [
          { k: 'sensor', label: '温湿度传感器', unit: '个' },
          { k: 'ac-controller', label: '空调控制器', unit: '个' },
          { k: 'panel', label: '智能面板', unit: '个' }
        ]
      },
      {
        k: 'network',
        label: '网络覆盖',
        children: [
          { k: 'router', label: '路由器', unit: '台' },
          { k: 'ap', label: 'AP 面板', unit: '个' },
          { k: 'switch', label: '交换机', unit: '台' }
        ]
      }
    ]
  },
  {
    k: 'decor',
    label: '装饰',
    icon: 'ri:plant-line',
    children: [
      {
        k: 'curtain',
        label: '窗帘',
        children: [
          { k: 'cloth', label: '布帘', unit: '㎡' },
          { k: 'sheer', label: '纱帘', unit: '㎡' },
          { k: 'track', label: '轨道/罗马杆', unit: 'm' },
          { k: 'blind', label: '百叶', unit: '㎡' }
        ]
      },
      {
        k: 'rug',
        label: '地毯',
        children: [
          { k: 'living', label: '客厅地毯', unit: '㎡' },
          { k: 'bedroom', label: '卧室地毯', unit: '㎡' },
          { k: 'mat', label: '地垫', unit: '块' }
        ]
      },
      {
        k: 'art',
        label: '挂画饰品',
        children: [
          { k: 'painting', label: '装饰画', unit: '幅' },
          { k: 'mirror', label: '镜子', unit: '面' },
          { k: 'ornament', label: '摆件', unit: '件' },
          { k: 'aroma', label: '香薰', unit: '件' }
        ]
      },
      {
        k: 'plant',
        label: '绿植花器',
        children: [
          { k: 'plant', label: '绿植', unit: '盆' },
          { k: 'vase', label: '花器', unit: '件' }
        ]
      },
      {
        k: 'bedding',
        label: '床品布艺',
        children: [
          { k: 'bedding', label: '四件套', unit: '套' },
          { k: 'quilt', label: '被芯', unit: '件' },
          { k: 'pillow', label: '枕芯', unit: '个' },
          { k: 'blanket', label: '毯子', unit: '件' },
          { k: 'cushion', label: '抱枕', unit: '个' }
        ]
      },
      {
        k: 'storage',
        label: '收纳',
        children: [
          { k: 'box', label: '收纳盒', unit: '个' },
          { k: 'hanger', label: '衣架', unit: '件' }
        ]
      }
    ]
  }
]

export const hardTree = build('hard', hardSeed)
export const softTree = build('soft', softSeed)
export const categoryTree = [...hardTree, ...softTree]

interface CategoryEntry {
  node: CategoryNode
  path: CategoryNode[]
}

const categoryIndex = new Map<string, CategoryEntry>()

function walk(nodes: CategoryNode[], ancestors: CategoryNode[]): void {
  nodes.forEach((node) => {
    const path = [...ancestors, node]
    categoryIndex.set(node.key, { node, path })
    if (node.children?.length) {
      walk(node.children, path)
    }
  })
}

walk(categoryTree, [])

/** 根据 key 取节点 */
export function getCategoryNode(key: string): CategoryNode | undefined {
  return categoryIndex.get(key)?.node
}

/** 根据 key 取从主类到当前节点的路径 */
export function getCategoryPath(key: string): CategoryNode[] {
  return categoryIndex.get(key)?.path ?? []
}

/** 取最末级名称，如「厨房墙砖」 */
export function getCategoryLabel(key: string): string {
  return getCategoryNode(key)?.label ?? key
}

/** 取完整路径名称，如「主材 / 瓷砖 / 厨房墙砖」 */
export function getCategoryFullLabel(key: string, separator = ' / '): string {
  return getCategoryPath(key)
    .map((item) => item.label)
    .join(separator)
}

/** 判断 key 是否属于某个前缀（含自身） */
export function isUnderCategory(key: string, prefix: string): boolean {
  return key === prefix || key.startsWith(`${prefix}.`)
}

/** 取默认单位 */
export function getCategoryUnit(key: string): string {
  return getCategoryNode(key)?.unit || '项'
}

/** 取所属主类 key，如 hard.main */
export function getRootCategoryKey(key: string): string {
  return key.split('.').slice(0, 2).join('.')
}

/** 取所属大侧（hard / soft） */
export function getSideOf(key: string): SideType {
  return key.split('.')[0] === 'soft' ? 'soft' : 'hard'
}

/** 收集某前缀下的所有叶子 key */
export function collectLeafKeys(prefix: string): string[] {
  const result: string[] = []
  categoryIndex.forEach((entry, key) => {
    if (isUnderCategory(key, prefix) && !entry.node.children?.length) {
      result.push(key)
    }
  })
  return result
}

/** 所有叶子节点 */
export function getAllLeaves(): CategoryNode[] {
  const result: CategoryNode[] = []
  categoryIndex.forEach((entry) => {
    if (!entry.node.children?.length) result.push(entry.node)
  })
  return result
}

/** 级联选择器选项结构 */
export interface CascaderOption {
  value: string
  label: string
  children?: CascaderOption[]
  /** 兼容 Element Plus 的 CascaderOption 索引签名 */
  [key: string]: unknown
}

/** 转为 ElCascader 可直接使用的选项 */
export function toCascaderOptions(nodes: CategoryNode[]): CascaderOption[] {
  return nodes.map((node) => ({
    value: node.key,
    label: node.label,
    children: node.children ? toCascaderOptions(node.children) : undefined
  }))
}
