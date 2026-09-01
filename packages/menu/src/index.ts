import Divider from './Divider.vue'
import Menu from './Menu.vue'
import MenuItem from './MenuItem.vue'
import MenuItemGroup from './MenuItemGroup.vue'
import placements from './placements'
import SubMenu from './SubMenu/index'

export type {
  ItemType,
  MenuMode,
  BuiltinPlacements,
  TriggerSubMenuAction,
  RenderIconInfo,
  RenderIconType,
  MenuInfo,
  MenuTitleInfo,
  MenuHoverEventHandler,
  SelectInfo,
  SelectEventHandler,
  MenuClickEventHandler,
  MenuRef,
  ComponentType,
  Components,
  PopupRender,
  SemanticName,
} from './interface'
export type { MenuProps } from './Menu'
export type { MenuItemProps } from './MenuItemProps'
export type { SubMenuProps, SubMenuSemanticName } from './SubMenuProps'
export type { MenuItemGroupProps } from './MenuItemGroupProps'

export { placements }

type MenuComponent = typeof Menu & {
  Item: typeof MenuItem
  SubMenu: typeof SubMenu
  ItemGroup: typeof MenuItemGroup
  Divider: typeof Divider
}

const MenuExport = Menu as MenuComponent

MenuExport.Item = MenuItem
MenuExport.SubMenu = SubMenu
MenuExport.ItemGroup = MenuItemGroup
MenuExport.Divider = Divider

export default MenuExport
