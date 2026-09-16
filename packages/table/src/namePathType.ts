type BaseNamePath = string | number | boolean | (string | number | boolean)[]
export type DeepNamePath<
  Store = any,
  ParentNamePath extends any[] = [],
> = ParentNamePath['length'] extends 3
  ? never
  : true extends (Store extends BaseNamePath ? true : false)
    ? ParentNamePath['length'] extends 0
      ? Store | BaseNamePath
      : Store extends any[]
        ? [...ParentNamePath, number]
        : never
    : Store extends any[]
      ?
          | [...ParentNamePath, number]
          | DeepNamePath<Store[number], [...ParentNamePath, number]>
      : keyof Store extends never
        ? Store
        : {
            [FieldKey in keyof Store]: Store[FieldKey] extends Function
              ? never
              :
                  | (ParentNamePath['length'] extends 0 ? FieldKey : never)
                  | [...ParentNamePath, FieldKey]
                  | DeepNamePath<
                      Required<Store>[FieldKey],
                      [...ParentNamePath, FieldKey]
                    >
          }[keyof Store]
