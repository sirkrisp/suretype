import type { AnyType } from "./validators/types"
import type { DecorationsHolder } from "./validators/decorations"
import { BaseValidator, TreeTraverser } from "./validators/base/validator"


export function validatorToSchema< T extends BaseValidator< unknown > >(
	validator: T,
	traverser: TreeTraverser
)
{
	return ( validator as any ).toSchema( traverser );
}

export function validatorType< T extends BaseValidator< unknown > >(
	validator: T
): AnyType
{
	return ( validator as any ).type;
}

export function validatorParent< T extends BaseValidator< unknown > >(
	validator: T
): undefined | T
{
	return ( validator as any )._parent;
}

export function cloneValidator< T extends BaseValidator< unknown > >(
	validator: T,
	clean: boolean
): T
{
	return ( validator as any ).clone( clean );
}

export function decorateValidator< T extends BaseValidator< unknown > >(
	validator: T,
	decorations: DecorationsHolder
): T
{
	( validator as any )._decorations = decorations;
	return validator;
}

export function getDecorations< T extends BaseValidator< unknown > >(
	validator: T
): DecorationsHolder | undefined
{
	return ( validator as any )._decorations;
}

const schemaLookup = new WeakMap< Function, BaseValidator< unknown > >( );

export function attachSchemaToValidator< Fn extends Function >(
	validator: Fn,
	schema: BaseValidator< unknown >
)
: typeof validator
{
	schemaLookup.set( validator, schema );
	return validator;
}

export function getValidatorSchema( val: any )
: BaseValidator< unknown > | undefined
{
	if ( val && val instanceof BaseValidator )
		return val;

	// Maybe validator function
	if ( val && val instanceof Function )
		return schemaLookup.get( val );

	return undefined;
}
