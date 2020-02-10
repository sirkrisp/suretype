import type {
	ExportRefMethod,
	OnTopLevelNameConflict,
	OnNonSuretypeValidator,
} from "./types"
import { DuplicateError } from "./errors"
import { BaseValidator } from "./validators/base/validator"
import { getDecorations } from "./validation"
import { TreeTraverserImpl } from "./tree-traverser"


export interface ExtractJsonSchemaOptions
{
	refMethod?: ExportRefMethod;
	onTopLevelNameConflict?: OnTopLevelNameConflict;
	onNonSuretypeValidator?: OnNonSuretypeValidator;
}

export interface SchemaWithDefinitions
{
	definitions: { [ name: string ]: any; };
}

/**
 * Get the JSON schema (as a JavaScript object) for an array of schema
 * validators.
 *
 * @param validators The validators to get the JSON schema from.
 */
export function extractJsonSchema(
	validators: Array< BaseValidator< any, any > >,
	{
		refMethod = 'ref-all',
		onTopLevelNameConflict = 'error',
		onNonSuretypeValidator = 'error',
	}: ExtractJsonSchemaOptions = { }
)
: { schema: SchemaWithDefinitions }
{
	if ( onNonSuretypeValidator === 'ignore' )
	{
		validators = validators
			.filter( validator => getDecorations( validator ) );
	}
	else if ( onNonSuretypeValidator === 'error' )
	{
		validators.forEach( validator =>
		{
			if ( !getDecorations( validator ) )
				throw new TypeError( "Got undecorated validator" );
		} );
	}

	if ( onTopLevelNameConflict === 'error' )
	{
		const nameSet = new Set< string >( );
		validators
		.map( validator => getDecorations( validator ) )
		.filter( < T >( t: T ): t is NonNullable< T > => !!t )
		.forEach( ( { options: { name } } ) =>
		{
			if ( nameSet.has( name ) )
				throw new DuplicateError(
					`Duplicate validators found with name "${name}"`
				);
			nameSet.add( name );
		} );
	}

	const traverser = new TreeTraverserImpl( validators, refMethod );
	const { schema } = traverser.getSchema( );

	return { schema };
}

/**
 * Get the JSON schema (as a JavaScript object) for a single schema validator.
 *
 * @param validator The validator to get the JSON schema from.
 */
export function extractSingleJsonSchema(
	validator: BaseValidator< any, any >
)
: Record< string, any >
{
	const { schema: { definitions } } =
		extractJsonSchema(
			[ validator ],
			{
				refMethod: 'no-refs',
				onNonSuretypeValidator: 'create-name',
				onTopLevelNameConflict: 'rename',
			}
		);
	return Object.values( definitions )[ 0 ];
}
